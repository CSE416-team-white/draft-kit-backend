import { isValidObjectId } from 'mongoose';
import { ForbiddenError } from '@/shared/server/http-errors';
import { LeagueModel } from './leagues.model';
import type { League, LeagueFilters } from '../types/leagues.types';
import type { LeagueInput } from '../types/leagues.types';

export class LeaguesService {
  async getLeagues(userId: string, filters: LeagueFilters = {}) {
    const {
      format,
      draftType,
      isDefault,
      search,
      page = 1,
      limit = 50,
    } = filters;

    const query: Record<string, unknown> = {
      userId,
    };

    if (format) {
      query.format = format;
    }

    if (draftType) {
      query.draftType = draftType;
    }

    if (isDefault !== undefined) {
      query.isDefault = isDefault;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [leagues, total] = await Promise.all([
      LeagueModel.find(query)
        .sort({ isDefault: -1, name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LeagueModel.countDocuments(query),
    ]);

    return {
      leagues,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getLeagueById(id: string, userId: string): Promise<League | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const league = (await LeagueModel.findOne({
      _id: id,
      userId,
    }).lean()) as League | null;

    if (league) {
      return league;
    }

    const existingLeague = await LeagueModel.exists({ _id: id });

    if (existingLeague) {
      throw new ForbiddenError('League does not belong to user');
    }

    return null;
  }

  async getLeagueByExternalId(
    externalId: string,
    userId: string,
  ): Promise<League | null> {
    const league = (await LeagueModel.findOne({
      externalId,
      userId,
    }).lean()) as League | null;

    if (league) {
      return league;
    }

    const existingLeague = await LeagueModel.exists({ externalId });

    if (existingLeague) {
      throw new ForbiddenError('League does not belong to user');
    }

    return null;
  }

  async upsertLeague(
    userId: string,
    leagueData: LeagueInput,
  ): Promise<League> {
    const updated = await LeagueModel.findOneAndUpdate(
      { externalId: leagueData.externalId, userId },
      { $set: { ...leagueData, userId } },
      { upsert: true, new: true, runValidators: true },
    ).lean();

    return updated as unknown as League;
  }

  async upsertLeagues(
    userId: string,
    leagues: LeagueInput[],
  ): Promise<number> {
    const operations = leagues.map((league) => ({
      updateOne: {
        filter: { externalId: league.externalId, userId },
        update: { $set: { ...league, userId } },
        upsert: true,
      },
    }));

    const result = await LeagueModel.bulkWrite(operations, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }

  async deleteLeagueById(id: string, userId: string): Promise<League | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const league = (await LeagueModel.findOneAndDelete({
      _id: id,
      userId,
    }).lean()) as League | null;

    if (league) {
      return league;
    }

    const existingLeague = await LeagueModel.exists({ _id: id });

    if (existingLeague) {
      throw new ForbiddenError('League does not belong to user');
    }

    return null;
  }
}

export const leaguesService = new LeaguesService();
