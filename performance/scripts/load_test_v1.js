import http from 'k6/http';
import { check, sleep } from 'k6';

// 1. Load Test Configuration
export const options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
    },
};

const BASE_URL = 'https://dev.api.pretamed.com';

export default function () {
    // 2. Login Operation (Replacing Cookie Injection with API Auth)
    const loginPayload = JSON.stringify({
        email: 'mridul108636@gmail.com', 
        password: '123456789',     
    });

    const loginParams = {
        headers: { 'Content-Type': 'application/json' },
    };

    const loginRes = http.post(`${BASE_URL}/user/login`, loginPayload, loginParams);

    // Verify login was successful
    check(loginRes, {
        'Login successful (status 200/201)': (r) => r.status === 200 || r.status === 201,
    });


    // 4. Test Target: Fetch Patient List API
    const patientListRes = http.get(`${BASE_URL}/patient/src/frm/db/csh/all?limit=10&skip=0`);

    check(patientListRes, {
        'Patient List loaded (status 200)': (r) => r.status === 200,
        'Response time benchmark < 1.5s': (r) => r.timings.duration < 1500,
    });

    sleep(1); // Virtual users wait for 1s before next iteration
}