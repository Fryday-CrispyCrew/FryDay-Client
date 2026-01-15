import api from "../../../shared/lib/api";

/**
 * GET /api/reports/monthly?year={year}&month={month}
 * @param {number} year  예: 2025
 * @param {number} month 1~12
 * @returns {Promise<Object>} monthly report response
 */
export async function getReport(year, month) {
    const res = await api.get("/api/reports/monthly", {
        params: { year, month },
    });
    return res.data;
}
