import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import { seedMasterUsers } from './common__master_users.seed.mjs';
import { seedMasterCompanys } from './common__master_companys.seed.mjs';
import { seedMasterDepartments } from './common__master_departments.seed.mjs';
import { seedUserDepartments } from './common__user_departments.seed.mjs';

import { seedMasterStatus } from './approval__master_status.seed.mjs';
import { seedMasterDepartmentApproverAndReviewers } from './approval__master_department_approver_reviewers.seed.mjs';

import { seedMasterStatus as seedApplyMasterStatus } from './apply__master_status.seed.mjs';
import { seedMasterEmployTypes } from './apply__master_employ_types.seed.mjs';
import { seedMasterStaffOptions } from './apply__master_staff_options.seed.mjs';
import { seedApplyForms } from './apply__apply_forms.seed.mjs';
import { seedMasterFormApproverAndViewers } from './apply__master_form_approver_viewers.seed.mjs';

import { seedMasterPermitCategories } from './assets__master_permits.seed.mjs';
import { seedPermits } from './assets__permits.seed.mjs';

const projectRef = process.env.SUPABASE_PROJECT_REF;

const rl = createInterface({ input, output });
const answer = await rl.question(`⚠️ ${projectRef} に SEED を適用します。project-ref を入力してください: `);
if ((projectRef) !== answer.trim()) {
    console.error('🛑 不一致。中止します。'); process.exit(1);
}

(async () => {
  try {
    // --- common
    await seedMasterUsers();
    await seedMasterCompanys();
    await seedMasterDepartments();
    await seedUserDepartments();

    // --- approval
    await seedMasterStatus();
    await seedMasterDepartmentApproverAndReviewers();

    // --- apply
    await seedMasterEmployTypes();
    await seedMasterStaffOptions();
    await seedApplyMasterStatus();
    await seedApplyForms();
    await seedMasterFormApproverAndViewers();

    // --- assets
    await seedMasterPermitCategories();
    await seedPermits();

    console.log('Seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
})();
