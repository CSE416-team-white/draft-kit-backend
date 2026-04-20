import { LeagueModel } from './leagues.model';
import type { League, LeagueFilters } from '../types/leagues.types';

export class LeaguesService {
  async getLeagues(filters: LeagueFilters = {}) {
    const {
      format,
      draftType,
      isDefault,
      search,
      page = 1,
      limit = 50,
    } = filters;

    const query: Record<string, unknown> = {};

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

  async getLeagueById(id: string): Promise<League | null> {
    return (await LeagueModel.findById(id).lean()) as League | null;
  }

  async getLeagueByExternalId(externalId: string): Promise<League | null> {
    return (await LeagueModel.findOne({ externalId }).lean()) as League | null;
  }

  async upsertLeague(
    leagueData: Omit<League, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<League> {
    const updated = await LeagueModel.findOneAndUpdate(
      { externalId: leagueData.externalId },
      leagueData,
      { upsert: true, new: true, runValidators: true },
    ).lean();

    return updated as unknown as League;
  }

  async upsertLeagues(
    leagues: Omit<League, '_id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<number> {
    const operations = leagues.map((league) => ({
      updateOne: {
        filter: { externalId: league.externalId },
        update: { $set: league },
        upsert: true,
      },
    }));

    const result = await LeagueModel.bulkWrite(operations, { ordered: false });
    return result.upsertedCount + result.modifiedCount;
  }

  async deleteLeagueById(id: string): Promise<League | null> {
    return (await LeagueModel.findByIdAndDelete(id).lean()) as League | null;
  }
}

export const leaguesService = new LeaguesService();
