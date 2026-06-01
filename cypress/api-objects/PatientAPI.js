import BaseAPI from "./BaseAPI";

class PatientAPI extends BaseAPI {
    /**
     * Gets the list of patients from the database cache
     */
    getPatientsList(limit = 10, skip = 0) {
        return this.sendRequest({
            endpoint: `/patient/src/frm/db/csh/all?limit=${limit}&skip=${skip}`,
            method: 'GET'
        });
    }

    /**
     * Fetches current authenticated user status
     */
    getAuthStatus() {
        return this.sendRequest({
            endpoint: '/user/auth',
            method: 'GET'
        });
    }
}

export default new PatientAPI();