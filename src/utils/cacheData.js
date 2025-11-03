class TTLCache {
    constructor({ ttl = 60_000, maxSize = 1000 } = {}) {
        this.ttl = ttl;
        this.maxSize = maxSize;
        this.store = new Map();
        this.inflight = new Map();
    }

    _now() { return Date.now(); }

    get(key) {
        const hit = this.store.get(key);
        if (!hit) return undefined;
        if (hit.expires <= this._now()) {
            this.store.delete(key);
            return undefined;
        }
        return hit.value;
    }

    set(key, value, ttl = this.ttl) {
        if (this.store.size >= this.maxSize) {

            const oldestKey = this.store.keys().next().value;
            this.store.delete(oldestKey);
        }
        this.store.set(key, { value, expires: this._now() + ttl });
        return value;
    }

    delete(key) { this.store.delete(key); }
    clear() { this.store.clear(); this.inflight.clear(); }

    async memo(key, ttlOrFn, maybeFn) {
        const fn = typeof ttlOrFn === 'function' ? ttlOrFn : maybeFn;
        const ttl = typeof ttlOrFn === 'number' ? ttlOrFn : this.ttl;

        const cached = this.get(key);
        if (cached !== undefined) return cached;

        if (this.inflight.has(key)) return this.inflight.get(key);

        const p = (async () => {
        try {
            const value = await fn();
            this.set(key, value, ttl);
            return value;
        } finally {
            this.inflight.delete(key);
        }
        })();

        this.inflight.set(key, p);
        return p;
    }
}

module.exports = { TTLCache };
