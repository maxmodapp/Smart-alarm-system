import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

export type AlarmState = "DESARMADA" | "ARMANDO" | "ARMADA" | "DISPARADA";
type Zones = { z1: boolean; z2: boolean; z3: boolean };
type ZoneNames = { z1: string; z2: string; z3: string };

export type HistoryItem =
  | { tipo: "DISPARO"; zona: number; t: number }
  | { tipo: "ARMADA"; t: number }
  | { tipo: "DESARMADA"; t: number }
  | { tipo: "CAMBIO_ZONA"; zona: number; valor: boolean; t: number };

type WsConfig = { ip: string; port: string; path: string };

const NKEY = "alarm_zone_names";
const LOCAL_ARMING_SECONDS = 60;

// Config de WS
const WSCFG_KEY = "alarm_ws_config_v1";   
const WS_AUTO_KEY = "alarm_ws_auto_v1";   


type Ctx = {

  state: AlarmState;
  armingLeft: number; 

  zones: Zones;

  zonesActive: Zones;
  names: ZoneNames;
  history: HistoryItem[];
  activeCount: number;


  disparoZona: number; 

  // WS
  connected: boolean;
  connecting: boolean;
  wantConnected: boolean;
  autoReconnect: boolean;
  wsConfig: WsConfig;

  setWsConfig(partial: Partial<WsConfig>): Promise<void>;
  setAutoReconnect(v: boolean): Promise<void>;

  connect(): void;
  disconnect(): void;

  // Comandos hacia ESP
  arm(): Promise<void>;
  disarm(): Promise<void>;
  setZone(k: keyof Zones, value: boolean): Promise<void>;


  saveNames(n: ZoneNames): Promise<void>;

  // Historial 
  requestHistory(): void;

};

const AlarmContext = createContext<Ctx | null>(null);


function normalizeEstado(v: any): AlarmState | null {
  if (typeof v === "string") {
    const s = v.trim().toUpperCase();
    if (s === "DESARMADA" || s === "DESARMADO") return "DESARMADA";
    if (s === "ARMANDO") return "ARMANDO";
    if (s === "ARMADA" || s === "ARMADO") return "ARMADA";
    if (s === "DISPARADA" || s === "DISPARO") return "DISPARADA";


    if (s.includes("DESARM")) return "DESARMADA";
    if (s.includes("ARMANDO")) return "ARMANDO";
    if (s.includes("ARMAD")) return "ARMADA";
    if (s.includes("DISPAR")) return "DISPARADA";
  }


  if (typeof v === "number") {
    if (v === 0) return "DESARMADA";
    if (v === 1) return "ARMANDO";
    if (v === 2) return "ARMADA";
    if (v === 3) return "DISPARADA";
  }

  return null;
}

function parseIntSafe(v: any): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v.trim(), 10);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function maskToZones(mask: number): Zones {
  return {
    z1: (mask & 0b001) !== 0,
    z2: (mask & 0b010) !== 0,
    z3: (mask & 0b100) !== 0,
  };
}

/**
 * Paquete que manda  ESP (sketch):
 * { estado: "", mask_enable: number, mask_active: number, disparo_zona: numberr }
 */
function applyIncomingPacket(
  raw: string,
  setState: (s: AlarmState) => void,
  setArmingLeft: (n: number) => void,
  setZones: React.Dispatch<React.SetStateAction<Zones>>,
  setZonesActive: React.Dispatch<React.SetStateAction<Zones>>,
  setDisparoZona: (n: number) => void
) {
  try {
    const obj = JSON.parse(raw);

    const st = normalizeEstado(obj?.estado);
    if (st) setState(st);


    if (typeof obj?.armingLeft === "number") setArmingLeft(obj.armingLeft);


    const mEnable = parseIntSafe(obj?.mask_enable);
    if (mEnable !== null) setZones(maskToZones(mEnable));


    const mActive = parseIntSafe(obj?.mask_active);
    if (mActive !== null) setZonesActive(maskToZones(mActive));


    const dz = parseIntSafe(obj?.disparo_zona);
    if (dz !== null) setDisparoZona(dz);
  } catch {}
}


export function AlarmProvider({ children }: { children: React.ReactNode }) {

  const [state, setState] = useState<AlarmState>("DESARMADA");
  const [armingLeft, setArmingLeft] = useState(60);
  const [zones, setZones] = useState<Zones>({ z1: false, z2: false, z3: false });
  const [zonesActive, setZonesActive] = useState<Zones>({ z1: false, z2: false, z3: false });
  const [names, setNames] = useState<ZoneNames>({ z1: "Zona 1", z2: "Zona 2", z3: "Zona 3" });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [disparoZona, setDisparoZona] = useState(0);


  const [wsConfig, setWsConfigState] = useState<WsConfig>({ ip: "192.168.1.100", port: "81", path: "" });
  const [autoReconnect, setAutoReconnectState] = useState(true);
  const [wantConnected, setWantConnectedState] = useState(false);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const backoffMsRef = useRef(800);
  const lastRxRef = useRef<number>(Date.now());


  const wsConfigRef = useRef(wsConfig);
  const autoReconnectRef = useRef(autoReconnect);
  const wantConnectedRef = useRef(wantConnected);

  useEffect(() => { wsConfigRef.current = wsConfig; }, [wsConfig]);
  useEffect(() => { autoReconnectRef.current = autoReconnect; }, [autoReconnect]);
  useEffect(() => { wantConnectedRef.current = wantConnected; }, [wantConnected]);


  const armingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const armingEndMsRef = useRef<number | null>(null);

  useEffect(() => {
    if (state === "ARMANDO") {
      if (armingEndMsRef.current === null) {
        armingEndMsRef.current = Date.now() + LOCAL_ARMING_SECONDS * 1000;
        setArmingLeft(LOCAL_ARMING_SECONDS);
      }
      if (!armingTimerRef.current) {
        armingTimerRef.current = setInterval(() => {
          const end = armingEndMsRef.current;
          if (end === null) return;
          const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
          setArmingLeft(left);
        }, 250);
      }
    } else {
      if (armingTimerRef.current) {
        clearInterval(armingTimerRef.current);
        armingTimerRef.current = null;
      }
      armingEndMsRef.current = null;
      setArmingLeft(0);
    }
    return () => {};
  }, [state]);


  useEffect(() => {
    (async () => {
      try {
        const n = await AsyncStorage.getItem(NKEY);
        if (n) setNames(JSON.parse(n));

        const cfg = await AsyncStorage.getItem(WSCFG_KEY);
        if (cfg) {
          const parsed = JSON.parse(cfg);
          if (parsed?.ip && parsed?.port) setWsConfigState({ ip: String(parsed.ip), port: String(parsed.port), path: String(parsed.path ?? "") });
        }
        const ar = await AsyncStorage.getItem(WS_AUTO_KEY);
        if (ar === "0") setAutoReconnectState(false);
        if (ar === "1") setAutoReconnectState(true);
      } catch (err) {
        console.warn("Error loading alarm data", err);
      }
    })();

    return () => {
      cleanupWs();
    };

  }, []);

  const saveNames = async (n: ZoneNames) => {
    setNames(n);
    await AsyncStorage.setItem(NKEY, JSON.stringify(n));
  };

  const addHistory = async (item: HistoryItem) => {


    setHistory(prev => [item, ...prev].slice(0, 300));
  };

  const requestHistory = () => {

    sendLine("HIST");
  };

  const replaceHistoryFromEsp = (items: any) => {
    if (!Array.isArray(items)) return;

    const parsed: HistoryItem[] = [];
    for (const it of items) {
      if (!it || typeof it !== "object") continue;
      const tipo = typeof it.tipo === "string" ? it.tipo.toUpperCase() : "";
      const t = parseIntSafe((it as any).t);
      if (t === null) continue;

      if (tipo === "ARMADA") parsed.push({ tipo: "ARMADA", t });
      else if (tipo === "DESARMADA") parsed.push({ tipo: "DESARMADA", t });
      else if (tipo === "DISPARO") {
        const z = parseIntSafe((it as any).zona) ?? 0;
        parsed.push({ tipo: "DISPARO", zona: z, t });
      }
    }


    const seen = new Set<string>();
    const deduped: HistoryItem[] = [];
    for (const h of parsed) {
      const key = h.tipo === "DISPARO" ? `${h.tipo}|${h.zona}|${h.t}` : `${h.tipo}|${h.t}`;
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(h);
    }
    setHistory(deduped);
  };

  const setWsConfig = async (partial: Partial<WsConfig>) => {
    setWsConfigState(prev => {
      const next: WsConfig = { ...prev, ...partial };
      wsConfigRef.current = next;
      AsyncStorage.setItem(WSCFG_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setAutoReconnect = async (v: boolean) => {
    setAutoReconnectState(v);
    autoReconnectRef.current = v;
    await AsyncStorage.setItem(WS_AUTO_KEY, v ? "1" : "0");
  };


  const getWsUrl = () => {
    const cfg = wsConfigRef.current;
    return `ws://${cfg.ip}:${cfg.port}${cfg.path}`;
  };

  const stopPoll = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPoll = () => {
    if (pollTimerRef.current) return;
    pollTimerRef.current = setInterval(() => {

      sendLine("GET");


      const age = Date.now() - lastRxRef.current;
      if (age > 25000) {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
          try { ws.close(); } catch {}
        }
      }
    }, 10000);
  };

  const cleanupWs = () => {
    stopPoll();
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws) {
      try {
        ws.onopen = null as any;
        ws.onmessage = null as any;
        ws.onerror = null as any;
        ws.onclose = null as any;
        ws.close();
      } catch {}
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimerRef.current) return;


    if (!wantConnectedRef.current) return;
    if (!autoReconnectRef.current) return;

    setConnecting(true);
    const wait = Math.min(backoffMsRef.current, 6000);

    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connectWs();
    }, wait);

    backoffMsRef.current = Math.min(backoffMsRef.current * 1.7, 6000);
  };

  const connectWs = () => {

    if (!wantConnectedRef.current) return;

    const current = wsRef.current;
    if (current && (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnecting(true);
    setConnected(false);

    const url = getWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      backoffMsRef.current = 800;
      lastRxRef.current = Date.now();

      setConnecting(false);
      setConnected(true);


      sendLine("GET");
      requestHistory();
      startPoll();
    };

    ws.onmessage = (ev) => {
      const raw = typeof ev.data === "string" ? ev.data : "";
      if (!raw) return;
      lastRxRef.current = Date.now();
      console.log("[WS RX]", raw.trim());


      try {
        const obj = JSON.parse(raw);
        if (obj?.type === "HIST") {
          replaceHistoryFromEsp(obj?.items);
          return;
        }
      } catch {

      }


      applyIncomingPacket(raw, setState, setArmingLeft, setZones, setZonesActive, setDisparoZona);
    };

    ws.onerror = () => {

    };

    ws.onclose = () => {
      stopPoll();
      setConnected(false);


      scheduleReconnect();


      if (!wantConnectedRef.current || !autoReconnectRef.current) {
        setConnecting(false);
      }
    };
  };

  const connect = () => {
    setWantConnectedState(true);
    wantConnectedRef.current = true;
    backoffMsRef.current = 800;
    connectWs();
  };

  const disconnect = () => {
    setWantConnectedState(false);
    wantConnectedRef.current = false;
    setConnecting(false);
    setConnected(false);
    cleanupWs(); 
  };



  const sendLine = (line: string): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    try {
      const payload = line.endsWith("\n") ? line : line + "\n";
      console.log("[WS TX]", line);
      ws.send(payload);
      return true;
    } catch {
      try { ws.close(); } catch {}
      return false;
    }
  };


  const arm = async () => {

    sendLine("ARM");
  };

  const disarm = async () => {
    sendLine("DISARM");
  };

  const setZone = async (k: keyof Zones, value: boolean) => {
    const cmd = `${k}=${value ? 1 : 0}`;

    sendLine(cmd);
  };

  const activeCount = useMemo(() => Number(zones.z1) + Number(zones.z2) + Number(zones.z3), [zones]);

  const value: Ctx = {
    state,
    armingLeft,
    zones,
    zonesActive,
    names,
    history,
    activeCount,
    disparoZona,

    connected,
    connecting,
    wantConnected,
    autoReconnect,
    wsConfig,

    setWsConfig,
    setAutoReconnect,

    connect,
    disconnect,

    arm,
    disarm,
    setZone,

    saveNames,

    requestHistory,

  };

  return <AlarmContext.Provider value={value}>{children}</AlarmContext.Provider>;
}

export const useAlarm = () => {
  const ctx = useContext(AlarmContext);
  if (!ctx) throw new Error("useAlarm must be used within AlarmProvider");
  return ctx;
};
