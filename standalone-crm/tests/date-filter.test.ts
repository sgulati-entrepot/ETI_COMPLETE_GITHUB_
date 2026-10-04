import test from 'node:test';
import assert from 'node:assert/strict';
import {inDateRange,enrolmentDay} from '../app/crm/date-filter';
import {blankLead} from '../app/crm/model';
test('date filters include endpoints and exclude missing dates only when active',()=>{
 assert.equal(inDateRange(undefined,'',''),true);
 assert.equal(inDateRange(undefined,'','2026-10-03'),false);
 assert.equal(inDateRange('2026-10-03','2026-10-03','2026-10-03'),true);
 assert.equal(inDateRange('2026-10-02','2026-10-03',''),false);
 assert.equal(inDateRange('2026-10-04','','2026-10-03'),false);
 assert.equal(inDateRange('2026-10-04','2026-10-03','2026-10-05'),true);
});
test('enrolment filters use manual date or UAE date from legacy timestamp',()=>{
 assert.equal(enrolmentDay({...blankLead(),enrolledAt:'2026-10-02T21:00:00Z'}),'2026-10-03');
 assert.equal(enrolmentDay({...blankLead(),enrolledAt:'2026-10-02T21:00:00Z',enrolmentDate:'2026-09-30'}),'2026-09-30');
});
