// Turns +63 917 123 4567 or 0917-123-4567 into 09171234567 so clients can be matched by number.
function normPhone(v) {
  let d = String(v || '').replace(/[^\d+]/g, '');
  if (d.startsWith('+63')) d = '0' + d.slice(3);
  else if (d.startsWith('63') && d.length === 12) d = '0' + d.slice(2);
  return d;
}
const validPhone = (v) => /^09\d{9}$/.test(normPhone(v));
module.exports = { normPhone, validPhone };
