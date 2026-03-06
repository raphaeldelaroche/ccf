const existing = {"version":"1.0","slug":"test-page","title":"Test Page","blocks":[],"meta":{"createdAt":"2026-03-06T11:43:52.498Z","updatedAt":"2026-03-06T11:43:52.498Z"}};
const body = {"blocks": [{"id": "123", "type": "paragraph"}]};
const merged = { ...existing, ...body };
console.log(merged);
