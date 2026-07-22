import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export async function createTeam(data, userId) {
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-');
  const existing = await prisma.team.findUnique({ where: { slug } });
  if (existing) throw ApiError.conflict('Team slug already exists');

  const team = await prisma.team.create({
    data: { name: data.name, slug, description: data.description, organizationId: data.organizationId },
  });

  await prisma.teamMember.create({
    data: { teamId: team.id, userId, role: 'ADMIN' },
  });

  return team;
}

export async function listTeams(userId) {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: { team: true },
  });
  return memberships.map((m) => m.team);
}

export async function getTeam(teamId) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } } },
      },
    },
  });
  if (!team) throw ApiError.notFound('Team not found');
  return team;
}

export async function updateTeam(teamId, data) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw ApiError.notFound('Team not found');
  return prisma.team.update({ where: { id: teamId }, data });
}

export async function deleteTeam(teamId) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) throw ApiError.notFound('Team not found');
  await prisma.team.delete({ where: { id: teamId } });
}

export async function addTeamMember(teamId, userId, role = 'MEMBER') {
  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
  });
  if (existing) throw ApiError.conflict('Member already in team');

  return prisma.teamMember.create({
    data: { teamId, userId, role },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
  });
}

export async function removeTeamMember(teamId, memberId) {
  const member = await prisma.teamMember.findFirst({ where: { id: memberId, teamId } });
  if (!member) throw ApiError.notFound('Member not found');
  await prisma.teamMember.delete({ where: { id: memberId } });
}
