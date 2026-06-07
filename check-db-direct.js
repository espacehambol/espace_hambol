const Database = require('better-sqlite3');

function checkDb(path) {
  try {
    const db = new Database(path, { fileMustExist: true });
    const count = db.prepare('SELECT COUNT(*) as count FROM Reservation').get().count;
    console.log(`[${path}] Reservations: ${count}`);
    const reqCount = db.prepare('SELECT COUNT(*) as count FROM ConciergeRequest').get().count;
    console.log(`[${path}] Concierge Requests: ${reqCount}`);
    
    if (count > 0) {
      const pending = db.prepare('SELECT COUNT(*) as count FROM Reservation WHERE status = "PENDING"').get().count;
      console.log(`[${path}] PENDING Reservations: ${pending}`);
      if (pending > 0) {
        db.prepare('UPDATE Reservation SET status = "CONFIRMED" WHERE status = "PENDING"').run();
        console.log(`[${path}] Updated PENDING Reservations to CONFIRMED.`);
      }
    }
    
    if (reqCount > 0) {
      const pendingReq = db.prepare('SELECT COUNT(*) as count FROM ConciergeRequest WHERE status = "PENDING"').get().count;
      console.log(`[${path}] PENDING Requests: ${pendingReq}`);
      if (pendingReq > 0) {
        db.prepare('UPDATE ConciergeRequest SET status = "COMPLETED" WHERE status = "PENDING"').run();
        console.log(`[${path}] Updated PENDING Requests to COMPLETED.`);
      }
    }
    
    db.close();
  } catch (e) {
    console.log(`[${path}] Error: ${e.message}`);
  }
}

checkDb('dev.db');
checkDb('prisma/dev.db');
