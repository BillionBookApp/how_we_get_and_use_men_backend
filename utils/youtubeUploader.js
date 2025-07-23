const fs = require('fs');
const { google } = require('googleapis');
const readline = require('readline');
// Use this instead where you call `open()`:
const open = (...args) => import('open').then(mod => mod.default(...args));

const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = 'token.json'; // Will be created on first run

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync('client_secret.json'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔑 Authorize this app by visiting this URL:\n\n' + authUrl);
  await open(authUrl);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise(resolve => rl.question('\n📥 Paste the code from Google here: ', resolve));
  rl.close();

  const { tokens } = await oAuth2Client.getToken(code);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  oAuth2Client.setCredentials(tokens);
  console.log('✅ Auth token saved. Ready to upload.');
  return oAuth2Client;
}

async function uploadVideo(filePath, title, description = '', privacy = 'unlisted') {
  const auth = await authorize();
  const youtube = google.youtube({ version: 'v3', auth });
  const fileSize = fs.statSync(filePath).size;

  const res = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: { title, description },
      status: { privacyStatus: privacy },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  }, {
    onUploadProgress: evt => {
      const progress = (evt.bytesRead / fileSize) * 100;
      process.stdout.write(`Uploading: ${Math.round(progress)}% \r`);
    }
  });

  console.log('\n🎬 Upload complete:');
  console.log(`👉 https://www.youtube.com/watch?v=${res.data.id}`);
  return `https://www.youtube.com/watch?v=${res.data.id}`;
}

module.exports = uploadVideo;
