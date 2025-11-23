import * as Location from 'expo-location';

export const getCurrentLocationWithArea = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return { latitude: null, longitude: null, area: null, postalCode: null, city: null };
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });

        let area = null;
        let postalCode = null;
        let city = null;

        if (reverseGeocode.length > 0) {
            const address = reverseGeocode[0];
            area = address.district || address.subregion || address.street; // Fallback strategy
            postalCode = address.postalCode;
            city = address.city || address.region;
        }

        return { latitude, longitude, area, postalCode, city };
    } catch (error) {
        console.error("Error getting location", error);
        return { latitude: null, longitude: null, area: null, postalCode: null, city: null };
    }
};
