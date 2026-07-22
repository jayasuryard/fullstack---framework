import * as billingService from '../services/billingService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

export async function listPlans(req, res, next) {
  try {
    const plans = await billingService.listPlans();
    sendSuccess(res, { plans });
  } catch (error) {
    next(error);
  }
}

export async function subscribe(req, res, next) {
  try {
    const subscription = await billingService.createSubscription(req.user.id, req.body.planId);
    sendSuccess(res, { subscription }, 'Subscribed successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function cancelSubscription(req, res, next) {
  try {
    const subscription = await billingService.cancelSubscription(req.params.id, req.user.id);
    sendSuccess(res, { subscription }, 'Subscription cancelled');
  } catch (error) {
    next(error);
  }
}

export async function getSubscription(req, res, next) {
  try {
    const subscription = await billingService.getUserSubscription(req.user.id);
    sendSuccess(res, { subscription });
  } catch (error) {
    next(error);
  }
}

export async function listInvoices(req, res, next) {
  try {
    const result = await billingService.listInvoices(req.user.id, req.query);
    sendPaginated(res, result.invoices, result.pagination);
  } catch (error) {
    next(error);
  }
}

export async function getUsage(req, res, next) {
  try {
    const { feature } = req.query;
    const usage = feature
      ? await billingService.getUsage(req.user.id, feature)
      : await billingService.getUsage(req.user.id, 'api_calls');
    sendSuccess(res, { usage });
  } catch (error) {
    next(error);
  }
}
