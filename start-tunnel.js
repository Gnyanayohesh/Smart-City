const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'stupid-goats-stand' });
    console.log('TUNNEL_URL:' + tunnel.url);
    fs.writeFileSync('tunnel-url.txt', tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
    });
  } catch (err) {
    console.error('Failed to create tunnel with subdomain, creating random:', err);
    try {
      const fallbackTunnel = await localtunnel({ port: 3000 });
      console.log('TUNNEL_URL:' + fallbackTunnel.url);
      fs.writeFileSync('tunnel-url.txt', fallbackTunnel.url);
    } catch (e) {
      console.error('Fallback tunnel failed:', e);
    }
  }
})();
