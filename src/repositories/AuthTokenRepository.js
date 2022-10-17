import SData from 'simple-data-storage';

export default class AuthTokenRepository {
    static getById(id) {
        return SData(id);
    };

    static setAuthToken(authToken, id) {
        SData(id, authToken);
    }
}
