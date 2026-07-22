import * as teamService from '../services/teamService.js';
import { sendSuccess } from '../utils/response.js';

export async function create(req, res, next) {
  try {
    const team = await teamService.createTeam(req.body, req.user.id);
    sendSuccess(res, { team }, 'Team created', 201);
  } catch (error) {
    next(error);
  }
}

export async function list(req, res, next) {
  try {
    const teams = await teamService.listTeams(req.user.id);
    sendSuccess(res, { teams });
  } catch (error) {
    next(error);
  }
}

export async function get(req, res, next) {
  try {
    const team = await teamService.getTeam(req.params.id);
    sendSuccess(res, { team });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const team = await teamService.updateTeam(req.params.id, req.body);
    sendSuccess(res, { team }, 'Team updated');
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    await teamService.deleteTeam(req.params.id);
    sendSuccess(res, null, 'Team deleted');
  } catch (error) {
    next(error);
  }
}

export async function addMember(req, res, next) {
  try {
    const member = await teamService.addTeamMember(req.params.id, req.body.userId, req.body.role);
    sendSuccess(res, { member }, 'Member added');
  } catch (error) {
    next(error);
  }
}

export async function removeMember(req, res, next) {
  try {
    await teamService.removeTeamMember(req.params.id, req.params.memberId);
    sendSuccess(res, null, 'Member removed');
  } catch (error) {
    next(error);
  }
}
