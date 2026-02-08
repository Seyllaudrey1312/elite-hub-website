// Edit these to match your local environment / device IP when testing on a phone or emulator.
export const API_BASE = 'http://localhost:5000/api'; // change to http://192.168.x.y:5000 for device
export const WEB_BASE = 'http://localhost:3000'; // frontend static server base

export async function fetchSubjects() {
  try {
    const res = await fetch(`${API_BASE}/subjects`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  } catch (err) {
    return { error: err.message };
  }
}
