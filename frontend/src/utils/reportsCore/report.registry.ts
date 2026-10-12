import { getCurrentUser } from "../../services/auth/authSession";
import type { ReportDefinition } from "./report.types";

type ReportModule = {default: ReportDefinition<unknown>;};

const user = getCurrentUser();

function loadReportModules(): Record<string, ReportModule> {
    const commonReports = import.meta.glob<ReportModule>(
        "../../pages/shared/reports/definitions/common/*.ts",
        { eager: true },
    );

    let roleReports: Record<string, ReportModule> = {};

    switch (user?.role) {
        case "Admin":
            roleReports = import.meta.glob<ReportModule>(
                "../../pages/shared/reports/definitions/admin/*.ts",
                { eager: true },
            );
            break;

        case "Seller":
            roleReports = import.meta.glob<ReportModule>(
                "../../pages/shared/reports/definitions/seller/*.ts",
                { eager: true },
            );
            break;

        default:
            return {};
    }
    return {
        ...commonReports,
        ...roleReports,
    };
}

const reportModules = loadReportModules();

export const reports: ReportDefinition<unknown>[] =
    Object.values(reportModules).map(({ default: report }) => report);

export function getReportById(
    id: string,
): ReportDefinition<unknown> | undefined {
    return reports.find((report) => report.id === id);
}