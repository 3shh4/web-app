import { expect, test, type Page } from '@playwright/test';
import { clearAppStorage, loginAsAdmin } from './helpers/auth';

async function closeAnyOpenDialog(page: Page) {
  await page.keyboard.press('Escape');

  await expect(page.getByRole('dialog')).not.toBeVisible({
    timeout: 3000,
  }).catch(() => {
    // Dialog może nie istnieć — wtedy ignorujemy.
  });
}

test.describe('ManageMe LAB08 CRUD e2e', () => {
  test.beforeEach(async ({ page }) => {
    await clearAppStorage(page);
    await loginAsAdmin(page);

    await expect(page.getByTestId('projects-panel')).toBeVisible();
    await expect(page.getByTestId('stories-panel')).toBeVisible();
  });

  test('user can create, edit, change status and delete project, story and task', async ({
    page,
  }) => {
    const projectName = 'Projekt E2E';
    const projectNameEdited = 'Projekt E2E Edited';

    const storyTitle = 'Historyjka E2E';
    const storyTitleEdited = 'Historyjka E2E Edited';

    const taskName = 'Zadanie E2E';
    const taskNameEdited = 'Zadanie E2E Edited';

    // CREATE PROJECT
    await page.getByTestId('project-name-input').fill(projectName);
    await page
      .getByTestId('project-description-input')
      .fill('Opis projektu E2E');
    await page.getByTestId('project-submit-button').click();

    await expect(
      page.getByTestId('project-item').filter({ hasText: projectName })
    ).toBeVisible();

    // EDIT PROJECT
    await page
      .getByTestId('project-item')
      .filter({ hasText: projectName })
      .getByTestId('project-edit-button')
      .click();

    await page.getByTestId('project-name-input').fill(projectNameEdited);
    await page
      .getByTestId('project-description-input')
      .fill('Opis projektu E2E po edycji');
    await page.getByTestId('project-submit-button').click();

    await expect(
      page.getByTestId('project-item').filter({ hasText: projectNameEdited })
    ).toBeVisible();

    // CREATE STORY
    await page.getByTestId('story-title-input').fill(storyTitle);
    await page
      .getByTestId('story-description-input')
      .fill('Opis historyjki E2E');
    await page.getByTestId('story-submit-button').click();

    await expect(
      page.getByTestId('story-item').filter({ hasText: storyTitle })
    ).toBeVisible();

    // EDIT STORY
    await page
      .getByTestId('story-item')
      .filter({ hasText: storyTitle })
      .getByTestId('story-edit-button')
      .click();

    await page.getByTestId('story-title-input').fill(storyTitleEdited);
    await page
      .getByTestId('story-description-input')
      .fill('Opis historyjki E2E po edycji');
    await page.getByTestId('story-submit-button').click();

    await expect(
      page.getByTestId('story-item').filter({ hasText: storyTitleEdited })
    ).toBeVisible();

    // CREATE TASK
    await page.getByLabel('Nazwa zadania').fill(taskName);

    await page.getByLabel('Historyjka').click();
    await page
      .getByRole('option', { name: new RegExp(storyTitleEdited) })
      .click();

    await page.getByLabel('Przewidywany czas').fill('5');
    await page.getByLabel('Opis zadania').fill('Opis zadania E2E');
    await page.getByRole('button', { name: 'Dodaj zadanie' }).click();

    await closeAnyOpenDialog(page);

    await expect(
      page.getByTestId('task-row').filter({ hasText: taskName })
    ).toBeVisible();

    // CHANGE TASK STATUS
    await page
      .getByTestId('task-row')
      .filter({ hasText: taskName })
      .getByTestId('task-details-button')
      .click();

    const taskDetailsPanel = page.getByTestId('task-details-panel');

    await expect(taskDetailsPanel).toBeVisible();

    await taskDetailsPanel.getByLabel('Status').click();
    await page.getByRole('option', { name: 'DOING' }).click();

    await closeAnyOpenDialog(page);

    await expect(
      page
        .getByTestId('task-row')
        .filter({ hasText: taskName })
        .filter({ hasText: 'DOING' })
    ).toBeVisible();

    // EDIT TASK
    await page
      .getByTestId('task-row')
      .filter({ hasText: taskName })
      .getByTestId('task-edit-button')
      .click();

    await page.getByLabel('Nazwa zadania').fill(taskNameEdited);
    await page.getByLabel('Opis zadania').fill('Opis zadania E2E po edycji');
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    await closeAnyOpenDialog(page);

    await expect(
      page.getByTestId('task-row').filter({ hasText: taskNameEdited })
    ).toBeVisible();

    // DELETE TASK
    await page
      .getByTestId('task-row')
      .filter({ hasText: taskNameEdited })
      .getByTestId('task-delete-button')
      .click();

    await closeAnyOpenDialog(page);

    await expect(
      page.getByTestId('task-row').filter({ hasText: taskNameEdited })
    ).not.toBeVisible();

    // DELETE STORY
    await page
      .getByTestId('story-item')
      .filter({ hasText: storyTitleEdited })
      .getByTestId('story-delete-button')
      .click();

    await expect(
      page.getByTestId('story-item').filter({ hasText: storyTitleEdited })
    ).not.toBeVisible();

    // DELETE PROJECT
    await page
      .getByTestId('project-item')
      .filter({ hasText: projectNameEdited })
      .getByTestId('project-delete-button')
      .click();

    await expect(
      page.getByTestId('project-item').filter({ hasText: projectNameEdited })
    ).not.toBeVisible();
  });
});