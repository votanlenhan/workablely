import { test, expect, APIRequestContext, PlaywrightTestArgs } from '@playwright/test';
import { Chance } from 'chance';
import { createRandomClient } from './utils/client-helpers';
import { createRandomShow, ShowData } from './utils/show-helpers';
import { createRandomUser, UserData } from './utils/user-helpers';
import { RoleName } from '../api/src/modules/roles/entities/role-name.enum'; 
import { CreateMemberEvaluationDto } from '../api/src/modules/member-evaluations/dto/create-member-evaluation.dto';
import { UpdateMemberEvaluationDto } from '../api/src/modules/member-evaluations/dto/update-member-evaluation.dto';
import { MemberEvaluation } from '../api/src/modules/member-evaluations/entities/member-evaluation.entity';

const chance = new Chance();
const BASE_URL = 'http://localhost:3000/api'; // This should be the same as in your playwright.config.ts

test.describe('MemberEvaluations API', () => {
  let adminContext: APIRequestContext;
  let managerContext: APIRequestContext;
  let regularUserContext: APIRequestContext;

  let adminUser: UserData;
  let managerUser: UserData;
  let regularUser: UserData;

  let testClient: any; // Consider using a more specific type if available from client-helpers
  let testShow: ShowData;
  let userToEvaluate: UserData;

  const createdEvaluationIds: string[] = [];

  test.beforeAll(async ({ playwright }) => {
    adminUser = await createRandomUser(playwright, BASE_URL, RoleName.ADMIN);
    managerUser = await createRandomUser(playwright, BASE_URL, RoleName.MANAGER);
    regularUser = await createRandomUser(playwright, BASE_URL, RoleName.USER); 
    userToEvaluate = await createRandomUser(playwright, BASE_URL, RoleName.USER); 

    adminContext = await playwright.request.newContext({
      baseURL: BASE_URL, // Playwright will prefix URLs with this
      extraHTTPHeaders: { 'Authorization': `Bearer ${adminUser.token}` },
    });
    managerContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${managerUser.token}` },
    });
    regularUserContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: { 'Authorization': `Bearer ${regularUser.token}` },
    });

    testClient = await createRandomClient(adminContext);
    testShow = await createRandomShow(adminContext, testClient.id);
  });

  test.afterAll(async () => {
    for (const id of createdEvaluationIds) {
      // Use the context that has permissions to delete, typically admin
      await adminContext.delete(`/member-evaluations/${id}`); // baseURL is applied automatically
    }
  });

  test('[POST] /member-evaluations - Admin should be able to create an evaluation for a show and user', async () => {
    const evaluationData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: userToEvaluate.id,
      rating: 5,
      comments: 'Excellent work by user on this show (Admin eval)',
    };
    const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status(), `Admin Create Eval Failed: ${await response.text()}`).toBe(201);
    const createdEvaluation = await response.json();
    expect(createdEvaluation.id).toBeDefined();
    expect(createdEvaluation.show_id).toBe(evaluationData.show_id);
    expect(createdEvaluation.evaluated_user_id).toBe(evaluationData.evaluated_user_id);
    expect(createdEvaluation.rating).toBe(evaluationData.rating);
    expect(createdEvaluation.comments).toBe(evaluationData.comments);
    createdEvaluationIds.push(createdEvaluation.id);
  });

  test('[POST] /member-evaluations - Manager should be able to create an evaluation', async ({ playwright }) => {
    const otherUserToEvaluate = await createRandomUser(playwright, BASE_URL, RoleName.USER); // Ensure a fresh user
    const evaluationData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: otherUserToEvaluate.id,
      rating: 4,
      comments: 'Good performance (Manager eval)',
    };
    const response = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status(), `Manager Create Eval Failed: ${await response.text()}`).toBe(201);
    const createdEvaluation = await response.json();
    expect(createdEvaluation.evaluator_user_id).toBe(managerUser.id);
    createdEvaluationIds.push(createdEvaluation.id);
  });

  test('[POST] /member-evaluations - Regular user should NOT be able to create an evaluation', async () => {
    const evaluationData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: userToEvaluate.id,
      rating: 3,
      comments: 'Regular user attempt',
    };
    const response = await regularUserContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status()).toBe(403);
  });

  test('[POST] /member-evaluations - Should return 400 if show_id is missing', async () => {
    const evaluationData = { evaluated_user_id: userToEvaluate.id, rating: 5, comments: 'Missing show_id' } as any;
    const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status()).toBe(400);
  });

  test('[POST] /member-evaluations - Should return 400 if evaluated_user_id is missing', async () => {
    const evaluationData = { show_id: testShow.id, rating: 5, comments: 'Missing evaluated_user_id' } as any;
    const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status()).toBe(400);
  });

  test('[POST] /member-evaluations - Should return 404 if show_id does not exist', async () => {
    const nonExistentShowId = chance.guid({ version: 4 });
    const evaluationData: CreateMemberEvaluationDto = {
      show_id: nonExistentShowId,
      evaluated_user_id: userToEvaluate.id,
      rating: 1,
      comments: 'Test with non-existent show',
    };
    const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status()).toBe(404);
  });

  test('[POST] /member-evaluations - Should return 404 if evaluated_user_id does not exist', async () => {
    const nonExistentUserId = chance.guid({ version: 4 });
    const evaluationData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: nonExistentUserId,
      rating: 1,
      comments: 'Test with non-existent user',
    };
    const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status()).toBe(404);
  });

  test('[POST] /member-evaluations - Should return 403 if evaluator tries to evaluate themselves', async () => {
    const evaluationData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: adminUser.id, // Admin tries to evaluate self
      rating: 3,
      comments: 'Self-evaluation attempt',
    };
    const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evaluationData });
    expect(response.status()).toBe(403);
  });

  test('[POST] /member-evaluations - Should return 409 if evaluation already exists for show and user', async ({ playwright }) => {
    const uniqueUserForConflictTest = await createRandomUser(playwright, BASE_URL, RoleName.USER);
    const conflictData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: uniqueUserForConflictTest.id,
      rating: 5,
      comments: 'First evaluation for conflict test',
    };
    let response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: conflictData });
    expect(response.status()).toBe(201);
    const createdFirstEvaluation = await response.json();
    createdEvaluationIds.push(createdFirstEvaluation.id);
    const conflictingEvaluationData: CreateMemberEvaluationDto = {
      show_id: testShow.id,
      evaluated_user_id: uniqueUserForConflictTest.id,
      rating: 4,
      comments: 'Second attempt - should conflict',
    };
    response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: conflictingEvaluationData });
    expect(response.status()).toBe(409);
  });

  test.describe('GET Endpoints', () => {
    let createdEvalForGetTests: MemberEvaluation;
    test.beforeAll(async ({ playwright }) => {
      const evalData: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: userToEvaluate.id,
        rating: 5,
        comments: 'Evaluation for GET tests by Admin'
      };
      const response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evalData });
      expect(response.status()).toBe(201);
      createdEvalForGetTests = await response.json();
      createdEvaluationIds.push(createdEvalForGetTests.id);
    });

    test('[GET] /member-evaluations/:id - Admin should get any evaluation', async () => {
      expect(createdEvalForGetTests, 'createdEvalForGetTests is not defined for Admin GET').toBeDefined();
      console.log('[Test 10 Debug] createdEvalForGetTests.evaluator_user_id:', createdEvalForGetTests.evaluator_user_id, 'adminUser.id:', adminUser.id);
      console.log('[Test 10 Debug] createdEvalForGetTests.evaluated_user_id:', createdEvalForGetTests.evaluated_user_id, 'userToEvaluate.id:', userToEvaluate.id);
      const response = await adminContext.get(`${BASE_URL}/member-evaluations/${createdEvalForGetTests.id}`);
      expect(response.ok(), `Admin GET Eval Failed: ${await response.text()}`).toBe(true);
      const evaluation = await response.json();
      expect(evaluation.id).toBe(createdEvalForGetTests.id);
      expect(evaluation.comments).toBe('Evaluation for GET tests by Admin');
    });

    test('[GET] /member-evaluations/:id - Should return 404 for non-existent ID', async () => {
      const nonExistentId = chance.guid({ version: 4 });
      const response = await adminContext.get(`${BASE_URL}/member-evaluations/${nonExistentId}`);
      expect(response.status()).toBe(404);
    });

    test('[GET] /member-evaluations/show/:showId - Should retrieve evaluations for a show', async ({ playwright }) => {
      const anotherUserForShow = await createRandomUser(playwright, BASE_URL, RoleName.USER);
      const anotherEvalData: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: anotherUserForShow.id,
        rating: 6,
        comments: 'Another evaluation for the same show',
      };
      const createResp = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: anotherEvalData });
      expect(createResp.status()).toBe(201);
      const createdAnotherEval = await createResp.json();
      createdEvaluationIds.push(createdAnotherEval.id);

      const response = await adminContext.get(`${BASE_URL}/member-evaluations/show/${testShow.id}`);
      expect(response.status()).toBe(200);
      const evaluations: MemberEvaluation[] = await response.json();
      expect(evaluations.length).toBeGreaterThanOrEqual(2);
      expect(evaluations.some(e => e.id === createdEvalForGetTests.id)).toBeTruthy();
      expect(evaluations.some(e => e.id === createdAnotherEval.id)).toBeTruthy();
      evaluations.forEach(e => expect(e.show_id).toBe(testShow.id));
    });

    test('[GET] /member-evaluations/user/:userId - Should retrieve evaluations for an evaluated user', async ({ playwright }) => {
      const anotherClient = await createRandomClient(adminContext);
      const anotherShowForUser = await createRandomShow(adminContext, anotherClient.id);
      const evalForSameUserData: CreateMemberEvaluationDto = {
        show_id: anotherShowForUser.id,
        evaluated_user_id: userToEvaluate.id,
        rating: 5,
        comments: 'Another evaluation for the same user on a different show',
      };
      const createRespUser = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evalForSameUserData });
      expect(createRespUser.status()).toBe(201);
      const createdAnotherEvalForUser = await createRespUser.json();
      createdEvaluationIds.push(createdAnotherEvalForUser.id);

      const response = await adminContext.get(`${BASE_URL}/member-evaluations/user/${userToEvaluate.id}`);
      expect(response.status()).toBe(200);
      const evaluations: MemberEvaluation[] = await response.json();
      expect(evaluations.length).toBeGreaterThanOrEqual(2);
      expect(evaluations.some(e => e.id === createdEvalForGetTests.id)).toBeTruthy();
      expect(evaluations.some(e => e.id === createdAnotherEvalForUser.id)).toBeTruthy();
      evaluations.forEach(e => expect(e.evaluated_user_id).toBe(userToEvaluate.id));
    });

    test('[GET] /member-evaluations/:id - Manager who created it should get the evaluation', async ({ playwright }) => {
      // Isolate this test: Create a new show and a new user specifically for this manager's evaluation
      const uniqueClientForTest6 = await createRandomClient(managerContext);
      const uniqueShowForTest6 = await createRandomShow(managerContext, uniqueClientForTest6.id);
      const uniqueUserToEvaluateForTest6 = await createRandomUser(playwright, BASE_URL, RoleName.USER);
      
      const evalDataByManager: CreateMemberEvaluationDto = {
        show_id: uniqueShowForTest6.id, // Use unique show
        evaluated_user_id: uniqueUserToEvaluateForTest6.id, // Use unique user
        rating: 4, comments: 'Eval by Manager for GET test'
      };
      const postRes = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataByManager });
      expect(postRes.status(), `Manager POST for Test 6 failed: ${await postRes.text()}`).toBe(201);
      const createdEvalByManager = await postRes.json();
      createdEvaluationIds.push(createdEvalByManager.id); 

      const response = await managerContext.get(`${BASE_URL}/member-evaluations/${createdEvalByManager.id}`);
      expect(response.status(), `Manager GET for their own Test 6 eval failed: ${await response.text()}`).toBe(200);
      const fetchedEval = await response.json();
      expect(fetchedEval.id).toBe(createdEvalByManager.id);
    });

    test('[GET] /member-evaluations/:id - Manager NOT creator should NOT get evaluation if not Admin', async () => {
      // Admin creates, Manager (different) tries to GET
      expect(createdEvalForGetTests, 'createdEvalForGetTests is not defined for Manager non-creator GET').toBeDefined();
      expect(createdEvalForGetTests.evaluator_user_id).toBe(adminUser.id); // Sanity check: admin created it
      expect(managerUser.id).not.toBe(adminUser.id); // Sanity check: manager is different
      console.log('[Test 10 Specific Debug] managerUser.id:', managerUser.id, 'createdEval.evaluator_id:', createdEvalForGetTests.evaluator_user_id, 'createdEval.evaluated_id:', createdEvalForGetTests.evaluated_user_id);

      const response = await managerContext.get(`${BASE_URL}/member-evaluations/${createdEvalForGetTests.id}`);
      expect(response.status()).toBe(403); // Forbidden
    });

    test('[GET] /member-evaluations/:id - Regular user (not creator, not admin, not evaluated) should NOT get evaluation', async () => {
      expect(createdEvalForGetTests, 'createdEvalForGetTests is not defined for Regular User GET').toBeDefined();
      console.log('[Test 14 Debug] regularUser.id:', regularUser.id, 'createdEval.evaluator_id:', createdEvalForGetTests.evaluator_user_id, 'createdEval.evaluated_id:', createdEvalForGetTests.evaluated_user_id);
      const response = await regularUserContext.get(`${BASE_URL}/member-evaluations/${createdEvalForGetTests.id}`);
      expect(response.status()).toBe(403); // Forbidden
    });

    test('[GET] /member-evaluations/:id - Evaluated user should be able to get their evaluation', async () => {
      // Need an eval where regularUserContext.id is the evaluated_user_id
      const evalDataForEvaluatedUser: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: regularUser.id, // This user is being evaluated
        rating: 3, comments: 'Eval for self-GET test'
      };
      const postRes = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataForEvaluatedUser });
      expect(postRes.status()).toBe(201);
      const evalForEvaluated = await postRes.json();
      createdEvaluationIds.push(evalForEvaluated.id);

      const response = await regularUserContext.get(`${BASE_URL}/member-evaluations/${evalForEvaluated.id}`);
      expect(response.ok(), `Evaluated user GET failed: ${await response.text()}`).toBe(true);
      const evaluation = await response.json();
      expect(evaluation.id).toBe(evalForEvaluated.id);
      expect(evaluation.comments).toBe('Eval for self-GET test');
    });

    test('[GET] /member-evaluations - Admin can list all evaluations', async () => {
      const response = await adminContext.get(`${BASE_URL}/member-evaluations?limit=5`);
      if(!response.ok()) { console.log('[Test 7 Error] Admin list failed:', await response.text()); }
      expect(response.ok()).toBe(true);
      const result = await response.json();
      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    test('[GET] /member-evaluations - Manager can list evaluations they made or are about them (if permitted by service logic)', async () => {
      const response = await managerContext.get(`${BASE_URL}/member-evaluations?limit=5`); // No specific filter, service decides
      if(!response.ok()) { console.log('[Test 11 Error] Manager list failed:', await response.text()); }
      expect(response.ok()).toBe(true);
      const result = await response.json();
      expect(result.items.length).toBeLessThanOrEqual(5);
    });

    test('[GET] /member-evaluations - Regular user can list evaluations about them', async () => {
      const response = await regularUserContext.get(`${BASE_URL}/member-evaluations?limit=5`);
      expect(response.ok(), `Regular user GET list failed: ${await response.text()}`).toBe(true);
      const result = await response.json();
      expect(result.items.length).toBeLessThanOrEqual(5);
      result.items.forEach((item: MemberEvaluation) => {
        expect(item.evaluated_user_id === regularUser.id || item.evaluator_user_id === regularUser.id).toBeTruthy();
      });
    });
  });

  test.describe('PATCH Endpoints', () => {
    let evalToUpdateByCreator: MemberEvaluation;
    let evalToUpdateByAdmin: MemberEvaluation;
    let evalForInvalidUpdate: MemberEvaluation;
    let uniqueUserForPatchCreator: UserData;
    let uniqueUserForPatchAdmin: UserData;
    let uniqueUserForPatchInvalid: UserData;

    test.beforeAll(async ({ playwright }) => {
      // Create unique users to be evaluated for each PATCH scenario to avoid conflicts
      uniqueUserForPatchCreator = await createRandomUser(playwright, BASE_URL, RoleName.USER);
      uniqueUserForPatchAdmin = await createRandomUser(playwright, BASE_URL, RoleName.USER);
      uniqueUserForPatchInvalid = await createRandomUser(playwright, BASE_URL, RoleName.USER);

      // Evaluation to be updated by its creator (manager)
      const evalDataForCreatorUpdate: CreateMemberEvaluationDto = {
        show_id: testShow.id, // Can still use common testShow
        evaluated_user_id: uniqueUserForPatchCreator.id, // Unique user
        rating: 3, comments: 'Initial comment by manager for PATCH test'
      };
      let response = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataForCreatorUpdate });
      expect(response.status(), `Setup for PATCH (Creator): POST failed: ${await response.text()}`).toBe(201);
      evalToUpdateByCreator = await response.json();
      createdEvaluationIds.push(evalToUpdateByCreator.id);
      expect(evalToUpdateByCreator.evaluator_user_id).toBe(managerUser.id);

      // Evaluation to be updated by Admin (originally created by manager for a different user)
      const evalDataForAdminUpdate: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: uniqueUserForPatchAdmin.id, // Unique user
        rating: 3, comments: 'Initial comment by manager, for Admin PATCH test'
      };
      response = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataForAdminUpdate });
      expect(response.status(), `Setup for PATCH (Admin): POST failed: ${await response.text()}`).toBe(201);
      evalToUpdateByAdmin = await response.json();
      createdEvaluationIds.push(evalToUpdateByAdmin.id);

      // Evaluation for testing invalid data update
      const evalDataForInvalidUpdate: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: uniqueUserForPatchInvalid.id, // Unique user
        rating: 4, comments: 'Initial comment for invalid PATCH test'
      };
      response = await adminContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataForInvalidUpdate });
      expect(response.status(), `Setup for PATCH (Invalid): POST failed: ${await response.text()}`).toBe(201);
      evalForInvalidUpdate = await response.json();
      createdEvaluationIds.push(evalForInvalidUpdate.id);
    });

    test('[PATCH] /member-evaluations/:id - Original evaluator (Manager) should update their evaluation', async () => {
      expect(evalToUpdateByCreator, "evalToUpdateByCreator is undefined in PATCH test").toBeDefined();
      const id = evalToUpdateByCreator.id;
      expect(id, 'evalToUpdateByCreator.id for PATCH is undefined').toBeDefined();
      expect(typeof id === 'string', 'evalToUpdateByCreator.id for PATCH is not a string').toBeTruthy();
      const updateDto: UpdateMemberEvaluationDto = { comments: 'Manager updated comment', rating: 10 };
      console.log(`[Test PATCH Manager] ID: ${id}, DTO: ${JSON.stringify(updateDto)}`);
      const response = await managerContext.patch(`${BASE_URL}/member-evaluations/${id}`, { data: updateDto });
      expect(response.status()).toBe(200);
      const updatedEval: MemberEvaluation = await response.json();
      expect(updatedEval.comment).toBe(updateDto.comment);
      expect(updatedEval.rating).toBe(updateDto.rating);
      expect(updatedEval.evaluator_user_id).toBe(managerUser.id);
    });

    test('[PATCH] /member-evaluations/:id - Admin should update any evaluation', async () => {
      expect(evalToUpdateByAdmin, "evalToUpdateByAdmin is undefined in PATCH test").toBeDefined();
      const id = evalToUpdateByAdmin.id;
      expect(id, 'evalToUpdateByAdmin.id for PATCH is undefined').toBeDefined();
      expect(typeof id === 'string', 'evalToUpdateByAdmin.id for PATCH is not a string').toBeTruthy();
      const updateDto: UpdateMemberEvaluationDto = { comments: 'Admin updated this comment', rating: 1 };
      console.log(`[Test PATCH Admin] ID: ${id}, DTO: ${JSON.stringify(updateDto)}`);
      const response = await adminContext.patch(`${BASE_URL}/member-evaluations/${evalToUpdateByAdmin.id}`, { data: updateDto });
      expect(response.status()).toBe(200);
      const updatedEval: MemberEvaluation = await response.json();
      expect(updatedEval.comment).toBe(updateDto.comment);
      expect(updatedEval.rating).toBe(updateDto.rating);
    });

    test('[PATCH] /member-evaluations/:id - Regular user (not creator, not admin) should NOT update evaluation', async () => {
      const updateDto: UpdateMemberEvaluationDto = { comment: 'Regular user malicious update' };
      const response = await regularUserContext.patch(`${BASE_URL}/member-evaluations/${evalToUpdateByCreator.id}`, { data: updateDto });
      expect(response.status()).toBe(403);
    });

    test('[PATCH] /member-evaluations/:id - Should return 404 for non-existent ID', async () => {
      const nonExistentId = chance.guid({ version: 4 });
      expect(nonExistentId, 'nonExistentId for PATCH 404 is undefined').toBeDefined();
      expect(typeof nonExistentId === 'string', 'nonExistentId for PATCH 404 is not a string').toBeTruthy();
      const updateDto: UpdateMemberEvaluationDto = { comments: 'Update non-existent' };
      console.log(`[Test PATCH 404] ID: ${nonExistentId}, DTO: ${JSON.stringify(updateDto)}`);
      const response = await adminContext.patch(`${BASE_URL}/member-evaluations/${nonExistentId}`, { data: updateDto });
      expect(response.status()).toBe(404);
    });

    test('[PATCH] /member-evaluations/:id - Should return 400 for invalid data (e.g., rating out of bounds)', async () => {
      const updateDto = { rating: 11 } as any;
      const response = await adminContext.patch(`${BASE_URL}/member-evaluations/${evalToUpdateByAdmin.id}`, { data: updateDto });
      expect(response.status()).toBe(400);
      const errorResponse = await response.json();
      expect(errorResponse.message).toContain('rating must not be greater than 10');
    });
  });

  test.describe('DELETE Endpoints', () => {
    let evalToDeleteByCreator: MemberEvaluation;
    let evalToDeleteByAdmin: MemberEvaluation;
    let evalForOtherManagerToDelete: MemberEvaluation;
    let uniqueUserForDeleteCreator: UserData;
    let uniqueUserForDeleteAdmin: UserData;
    let uniqueUserForDeleteOtherManager: UserData;

    test.beforeEach(async ({ playwright }) => {
      // Create unique users for each DELETE scenario
      uniqueUserForDeleteCreator = await createRandomUser(playwright, BASE_URL, RoleName.USER);
      uniqueUserForDeleteAdmin = await createRandomUser(playwright, BASE_URL, RoleName.USER);
      uniqueUserForDeleteOtherManager = await createRandomUser(playwright, BASE_URL, RoleName.USER);

      // Evaluation to be deleted by its creator (manager)
      const evalDataCreator: CreateMemberEvaluationDto = {
        show_id: testShow.id, // Can use common testShow
        evaluated_user_id: uniqueUserForDeleteCreator.id, // Unique user
        rating: 3, comments: 'Eval by Manager for DELETE test'
      };
      let response = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataCreator });
      expect(response.status(), `Setup for DELETE (Creator): POST failed: ${await response.text()}`).toBe(201);
      evalToDeleteByCreator = await response.json();
      createdEvaluationIds.push(evalToDeleteByCreator.id);

      // Evaluation to be deleted by Admin (created by manager for a different user)
      const evalDataAdmin: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: uniqueUserForDeleteAdmin.id, // Unique user
        rating: 3, comments: 'Eval by Manager, for Admin DELETE test'
      };
      response = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataAdmin });
      expect(response.status(), `Setup for DELETE (Admin): POST failed: ${await response.text()}`).toBe(201);
      evalToDeleteByAdmin = await response.json();
      createdEvaluationIds.push(evalToDeleteByAdmin.id);

      // Evaluation for another manager to attempt to delete (created by our main managerUser for a different user)
      const evalDataOtherManager: CreateMemberEvaluationDto = {
        show_id: testShow.id,
        evaluated_user_id: uniqueUserForDeleteOtherManager.id, // Unique user
        rating: 3, comments: 'Eval by Manager, for other Manager DELETE test'
      };
      response = await managerContext.post(`${BASE_URL}/member-evaluations`, { data: evalDataOtherManager });
      expect(response.status(), `Setup for DELETE (Other Manager): POST failed: ${await response.text()}`).toBe(201);
      evalForOtherManagerToDelete = await response.json();
      createdEvaluationIds.push(evalForOtherManagerToDelete.id);
    });

    test('[DELETE] /member-evaluations/:id - Original evaluator (Manager) should delete their evaluation', async () => {
      const response = await managerContext.delete(`${BASE_URL}/member-evaluations/${evalToDeleteByCreator.id}`);
      expect(response.status()).toBe(204);
      const getResponse = await managerContext.get(`${BASE_URL}/member-evaluations/${evalToDeleteByCreator.id}`);
      expect(getResponse.status()).toBe(404);
    });

    test('[DELETE] /member-evaluations/:id - Admin should delete any evaluation', async () => {
      const response = await adminContext.delete(`${BASE_URL}/member-evaluations/${evalToDeleteByAdmin.id}`);
      expect(response.status()).toBe(204);
      const getResponse = await adminContext.get(`${BASE_URL}/member-evaluations/${evalToDeleteByAdmin.id}`);
      expect(getResponse.status()).toBe(404);
    });

    test('[DELETE] /member-evaluations/:id - Regular user (not creator, not admin) should NOT delete evaluation', async () => {
      const response = await regularUserContext.delete(`${BASE_URL}/member-evaluations/${evalForOtherManagerToDelete.id}`);
      expect(response.status()).toBe(403);
      const getResponse = await adminContext.get(`${BASE_URL}/member-evaluations/${evalForOtherManagerToDelete.id}`);
      expect(getResponse.status()).toBe(200);
    });

    test('[DELETE] /member-evaluations/:id - Should return 404 for non-existent ID', async () => {
      const nonExistentId = chance.guid({ version: 4 });
      const response = await adminContext.delete(`${BASE_URL}/member-evaluations/${nonExistentId}`);
      expect(response.status()).toBe(404);
    });
  });
}); 