const FAVORITES_KEY = "favorites";

export function getFavorites() {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

export function isFavorite(id) {
    const favorites = getFavorites();

    for (const favorite of favorites) {
        if (favorite.id === id) {
            return true;
        }
    }

    return false;
}

export function toggleFavorite(item) {
    const favorites = getFavorites();

    let exist = false;

    for (const favorite of favorites) {
        if (favorite.id === item.id) {
            exist = true;
        }
    }

    if (exist) {
        const updatedFavorites = [];

        for (const favorite of favorites) {
            if (favorite.id !== item.id) {
                updatedFavorites.push(favorite);
            }
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));

        return false;
    }

    favorites.push(item);

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

    return true;
}