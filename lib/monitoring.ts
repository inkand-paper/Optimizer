import { prisma } from './prisma';

/**
 * [SaaS INFRA] - Health Checker
 * Performs an HTTP GET request to verify a site is UP and records latency.
 */
export async function performCheck(monitorId: string, url: string) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'NextOptimizerMonitor/1.0' },
      cache: 'no-store'
    });

    const latency = Date.now() - startTime;
    const status = response.ok ? 'UP' : 'DOWN';
    const message = response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`;

    // Record the check
    await prisma.check.create({
      data: {
        monitorId,
        status,
        latency,
        message
      }
    });

    // Update monitor status
    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status,
        lastChecked: new Date()
      }
    });

    return { status, latency, message };
  } catch (error) {
    const latency = Date.now() - startTime;
    const status = 'DOWN';
    const message = error instanceof Error ? error.message : 'Connection failed';

    await prisma.check.create({
      data: {
        monitorId,
        status,
        latency,
        message
      }
    });

    await prisma.monitor.update({
      where: { id: monitorId },
      data: {
        status,
        lastChecked: new Date()
      }
    });

    return { status, latency, message };
  }
}
