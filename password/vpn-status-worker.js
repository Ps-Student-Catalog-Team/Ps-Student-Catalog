
self.addEventListener('message', async (e) => {
  const { ip } = e.data;
  
  const controller = new AbortController();
  const timeout = 1000; // 
  
  const timeoutId = setTimeout(() => {
    controller.abort();
    self.postMessage({ ip, online: false });
  }, timeout);

  try {
    const response = await fetch(`http://${ip}/status`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    self.postMessage({ ip, online: response.ok });
  } catch (error) {
    clearTimeout(timeoutId);
    self.postMessage({ ip, online: false });
  }
});

const backendUrl = 'http://10.88.202.71:3000/api/vpn-status';
