import { Merchant } from "@/types/merchant";

export type TelemetryListener = (updatedMerchants: Merchant[]) => void;

class TelemetrySimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Set<TelemetryListener> = new Set();
  private isRunning: boolean = false;
  private speedMultiplier: number = 1; // 1x, 2x, 3x

  // Waypoints rute demonstrasi pergerakan gerobak Cuanki (m-1) dan Bakso Cuanki (m-6)
  private routeWaypointsM1: [number, number][] = [
    [107.6231, -6.9032],
    [107.6236, -6.9028],
    [107.6242, -6.9022],
    [107.6249, -6.9018],
    [107.6241, -6.9012],
    [107.6233, -6.9016],
    [107.6225, -6.9022],
    [107.6231, -6.9032],
  ];
  private currentStepM1: number = 0;

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setSpeed(multiplier: number) {
    this.speedMultiplier = multiplier;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const intervalMs = Math.max(1000, 3000 / this.speedMultiplier);

    this.intervalId = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      speedMultiplier: this.speedMultiplier,
    };
  }

  private tick() {
    this.currentStepM1 = (this.currentStepM1 + 1) % this.routeWaypointsM1.length;
    const target = this.routeWaypointsM1[this.currentStepM1];
    const prev = this.routeWaypointsM1[(this.currentStepM1 - 1 + this.routeWaypointsM1.length) % this.routeWaypointsM1.length];

    // Hitung arah hadap heading
    const dx = target[0] - prev[0];
    const dy = target[1] - prev[1];
    let heading = Math.round(Math.atan2(dx, dy) * (180 / Math.PI));
    if (heading < 0) heading += 360;

    // Dispatch update ke semua listener
    const nowIso = new Date().toISOString();
    this.listeners.forEach((listener) => {
      listener([
        {
          id: "m-1",
          location: {
            id: "loc-1",
            merchantId: "m-1",
            longitude: target[0],
            latitude: target[1],
            accuracyMeters: 4,
            heading,
            speedKmh: 3.5 * this.speedMultiplier,
            batteryLevel: 87,
            addressHint: "Menyusuri Jalan Cisangkuy / Taman Lansia",
            district: "Bandung Wetan",
            city: "Kota Bandung",
            capturedAt: nowIso,
          },
        } as unknown as Merchant,
      ]);
    });
  }
}

export const telemetrySimulator = new TelemetrySimulator();

