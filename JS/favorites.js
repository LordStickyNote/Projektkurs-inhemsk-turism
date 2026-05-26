const FAVORITES_KEY = "favorites";

export function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

export function isFavorite(id) {
    return getFavorites().includes(id);
}

export function toggleFavorite(id) {
    const favorites = getFavorites();

    if (favorites.includes(id)) {
        const updated = favorites.filter((fav) => fav !== id);

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));

        return false;
    }

    favorites.push(id);

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    return true;
}