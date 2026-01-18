import api from "../../../shared/lib/api";

/**
 * GET /api/daily-results
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Promise<{success:boolean, message:string, data:Array<{date:string, bowlType:string}>, timestamp:string}>}
 */
export async function getDailyResults(startDate, endDate) {
    const res = await api.get("/api/daily-results", {
        params: { startDate, endDate },
        meta: {skipErrorToast: true},
    });
    return res.data;
}


export async function getDailyResultsMap(startDate, endDate) {
    const body = await getDailyResults(startDate, endDate);
    const list = Array.isArray(body?.data) ? body.data : [];

    return list.reduce((acc, cur) => {
        if (cur?.date) acc[cur.date] = cur.bowlType;
        return acc;
    }, {});
}
