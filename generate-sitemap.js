const fs = require('fs');
const https = require('https');

const API_BASE_URL = 'https://api.wealthassociate.in';
const DOMAIN = 'https://www.realproperties.in';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]); // Ignore parse errors
        }
      });
    }).on('error', (e) => reject(e));
  });
}

async function generateSitemap() {
  try {
    console.log('Fetching approved properties...');
    const approvedRes = await fetchJson(`${API_BASE_URL}/properties/getApproveProperty`).catch(() => []);
    let approved = Array.isArray(approvedRes) ? approvedRes : (approvedRes.properties || []);
    
    console.log('Fetching community properties...');
    const communityRes = await fetchJson(`${API_BASE_URL}/realproperties/property/get`).catch(() => []);
    let community = Array.isArray(communityRes) ? communityRes : [];

    const allProperties = [...approved, ...community];
    console.log(`Found ${allProperties.length} total properties.`);

    const today = new Date().toISOString().split('T')[0];

    // Static URLs
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Core Pages -->
  <url>
    <loc>${DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/#all-listings-section</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/#features</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${DOMAIN}/#network</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${DOMAIN}/#contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Dynamic Property Pages -->
`;

    for (const prop of allProperties) {
      if (prop._id) {
        xml += `  <url>\n`;
        xml += `    <loc>${DOMAIN}/property/${prop._id}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>\n`;

    fs.writeFileSync('./public/sitemap.xml', xml);
    console.log('Successfully generated public/sitemap.xml with dynamic property URLs.');

  } catch (error) {
    console.error('Failed to generate sitemap:', error);
  }
}

generateSitemap();
