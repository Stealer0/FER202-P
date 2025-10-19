const STORAGE_KEY = 'practiceHistory';

function getAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveAll(map) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // ignore quota errors
    }
}

export function getUserHistory(userId) {
    const all = getAll();
    return all[userId] || [];
}

export function recordAttempt(userId, attempt) {
    if (!userId) return;
    const all = getAll();
    const list = all[userId] || [];
    list.push(attempt);
    all[userId] = list;
    saveAll(all);
}
