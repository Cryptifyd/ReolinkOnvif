const express = require('express');
const Onvif = require('node-onvif');

const app = express();
const PORT = 3000;

// GET /goto-home?ip=...&user=...&pass=...&preset=...
app.get('/goto', async (req, res) => {
  const { ip, user, pass, preset = '004' } = req.query;
  if (!ip || !user || !pass) {
    return res.status(400).send('Fehlende Parameter');
  }

  try {
    goToPreset(ip, user, pass, preset)
    console.log('Kamera-Befehl gesendet.');
    res.send('Preset ausgeführt');
  } catch (error) {
    console.error('Fehler:', error);
    res.status(500).send('Fehler beim Steuern der Kamera');
  }
});

app.get('/presets', async (req, res) => {
  const { ip, user, pass, preset = '0' } = req.query;
  if (!ip || !user || !pass) {
    return res.status(400).send('Fehlende Parameter');
  }

  try {
    const device = new Onvif.OnvifDevice({
      xaddr: `http://${ip}:8000/onvif/device_service`,
      user,
      pass
    });

    await device.init();

    let params = {
        'ProfileToken': '004',
    };
    // res.send(await device.getCurrentProfile())
    // Führe den GotoPreset-Befehl aus
    const result = await device.services.ptz.getPresets(params);
    res.send(result.converted.Body.GetPresetsResponse.Preset);
  } catch (error) {
    console.error('Fehler:', error);
    res.status(500).send('Fehler beim Steuern der Kamera');
  }
});

async function goToPreset(ip, user, pass, preset) {
    const device = new Onvif.OnvifDevice({
      xaddr: `http://${ip}:8000/onvif/device_service`,
      user,
      pass
    });

    await device.init();

    let params = {
        'ProfileToken': '000',
        'PresetToken' : preset,
        'Speed'       : {'x': 1, 'y': 1, 'z': 1}
    };
    // res.send(await device.getCurrentProfile())
    // Führe den GotoPreset-Befehl aus
    return await device.services.ptz.gotoPreset(params);
}

app.listen(PORT, () => {
  console.log(`ONVIF API läuft auf http://localhost:${PORT}`);
});
