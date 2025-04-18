import { db } from "@/db";
import { Injectable } from "@/lib/core";
import { activityLogs } from "@/db/schema/activityLogs";

import { ActivityLog } from "./activity-logs.validation";

@Injectable()
export class ActivityLogsService {
  public constructor() {}
  async createActivityLog(activityLog: ActivityLog) {
    await db.insert(activityLogs).values(activityLog);
  }
}
