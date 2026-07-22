import * as organizationService from '../services/organizationService.js';
import { sendSuccess } from '../utils/response.js';

export async function create(req, res, next) {
  try {
    const org = await organizationService.createOrganization(req.body, req.user.id);
    sendSuccess(res, { organization: org }, 'Organization created', 201);
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const organizations = await organizationService.listOrganizations(req.user.id);
    sendSuccess(res, { organizations });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const organization = await organizationService.getOrganization(req.params.id);
    sendSuccess(res, { organization });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const organization = await organizationService.updateOrganization(req.params.id, req.body);
    sendSuccess(res, { organization }, 'Organization updated');
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await organizationService.deleteOrganization(req.params.id);
    sendSuccess(res, null, 'Organization deleted');
  } catch (error) {
    next(error);
  }
}

export async function invite(req, res, next) {
  try {
    const { email, role } = req.body;
    const invitation = await organizationService.inviteMember(req.params.id, email, role, req.user.id);
    sendSuccess(res, { invitation }, 'Invitation sent', 201);
  } catch (error) {
    next(error);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const { token } = req.body;
    await organizationService.acceptInvitation(token, req.user.id);
    sendSuccess(res, null, 'Invitation accepted');
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    await organizationService.removeMember(req.params.id, req.params.memberId);
    sendSuccess(res, null, 'Member removed');
  } catch (error) {
    next(error);
  }
}
