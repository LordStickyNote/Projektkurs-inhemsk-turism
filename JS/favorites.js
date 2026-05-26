const FAVORITES_KEY = "favorites";

export function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY))
}

export function isFavorite(id) {
    return getFavorites().includes(id);
}