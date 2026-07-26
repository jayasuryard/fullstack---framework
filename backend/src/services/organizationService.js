import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import crypto from 'crypto';

export async function createOrganization(data, userId) {
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) throw ApiError.conflict('Organization slug already exists');

  const org = await prisma.organization.create({
    data: { name: data.name, slug, website: data.website, settings: data.settings || {} },
  });

  await prisma.organizationMember.create({
    data: { organizationId: org.id, userId, role: 'ADMIN' },
  });

  return org;
}

export async function listOrganizations(userId) {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true },
  });
  return memberships.map((m) => m.organization);
}

export async function getOrganization(orgId) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } } },
      },
      invitations: { where: { acceptedAt: null, expiresAt: { gt: new Date() } } },
    },
  });
  if (!org) throw ApiError.notFound('Organization not found');
  return org;
}

export async function updateOrganization(orgId, data) {
  return prisma.organization.update({ where: { id: orgId }, data });
}

export async function deleteOrganization(orgId) {
  await prisma.organization.update({
    where: { id: orgId },
    data: { deletedAt: new Date() },
  });
}

export async function inviteMember(orgId, email, role, invitedBy) {
  const existing = await prisma.invitation.findFirst({
    where: { email, organizationId: orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (existing) throw ApiError.conflict('Invitation already sent');

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return prisma.invitation.create({
    data: { email, organizationId: orgId, role, token, expiresAt, createdBy: invitedBy },
  });
}

export async function acceptInvitation(token, userId) {
  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation || invitation.expiresAt < new Date() || invitation.acceptedAt) {
    throw ApiError.badRequest('Invalid or expired invitation');
  }

  await prisma.$transaction([
    prisma.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } }),
    prisma.organizationMember.create({
      data: { organizationId: invitation.organizationId, userId, role: invitation.role },
    }),
  ]);
}

export async function removeMember(orgId, memberId) {
  const member = await prisma.organizationMember.findFirst({ where: { id: memberId, organizationId: orgId } });
  if (!member) throw ApiError.notFound('Member not found');
  await prisma.organizationMember.delete({ where: { id: memberId } });
}
