# AgriConnect Maintenance Schedule

## 1. Backup and recovery
| Item | Frequency | Procedure |
| --- | --- | --- |
| Database backup | Daily (and before every deployment) | Run: node scripts/backup.js. Copy the file from the backups folder to a second location (cloud drive or external disk) |
| Uploaded photos backup | Weekly | Copy public/uploads to the same second location |
| Backup retention | Keep 7 daily and 4 weekly copies | Delete older copies |
| Recovery | When data is lost or corrupted | 1. Stop the app. 2. Copy the latest good backup over agriconnect.db. 3. Start the app. 4. Log in, open the catalogue and one order to confirm data is back |
| Recovery test | Monthly | Restore a backup on a test machine and confirm login, catalogue and orders work |
| Note | | The free hosting disk is temporary. For real customer data, move to a paid persistent disk or a managed database before launch |

## 2. Dependency updates
| Task | Frequency | Procedure |
| --- | --- | --- |
| Check outdated packages | Weekly | npm outdated |
| Apply minor and patch updates | Monthly | npm update, run the regression test cases, commit, push (auto deploys) |
| Major version upgrades | Quarterly or when needed | Upgrade on a separate Git branch, test fully, then merge |
| Node.js version | Every 6 months | Move to the current LTS version, update NODE_VERSION on the host |

## 3. Security checks
| Task | Frequency | Procedure |
| --- | --- | --- |
| Vulnerability scan | Weekly | npm audit. Fix critical and high findings within 48 hours |
| Review admin and farmer accounts | Monthly | Remove unknown accounts, suspend inactive ones |
| Rotate SESSION_SECRET and admin password | Every 90 days | Change on the host dashboard, redeploy (users are logged out once) |
| Check failed-login patterns in logs | Weekly | Search logs for repeated 401 on /api/auth/login |
| SSL certificate check | Monthly | Click the padlock, confirm valid dates (renewal is automatic) |
| Secrets in Git | Each push | Confirm .env is not tracked: git ls-files |

## 4. Application health monitoring
| Task | Frequency | Procedure |
| --- | --- | --- |
| Uptime check of /health | Every 5 minutes (automatic) | Uptime monitor or host health check, email on failure |
| Review application logs | Daily | Logs tab, filter for error |
| Review CPU and memory | Weekly | Metrics tab, act if memory nears the 512 MB limit |
| Test the full journey (register, order, receipt) | Weekly | Run the Step 14 walk-through on the live site |

## 5. Responsibilities
Developer: backups, updates, security checks. Administrator: account and listing approvals, order status.