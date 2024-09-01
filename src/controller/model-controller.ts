import {
	DatabaseRecord,
	Join,
	QueryRepository,
	SelectQuery,
	and,
	like,
	or,
} from '@riao/dbal';
import { ControllerInterface } from '../controller/controller';
import {
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
	SearchRequest,
} from '@riao/server-contract/request';
import { KeyValExpression } from '@riao/dbal/expression/key-val-expression';
import { SearchResponse } from '@riao/server-contract';

export abstract class ModelController<T extends DatabaseRecord = DatabaseRecord>
implements ControllerInterface<T> {
	public repo: QueryRepository<T>;
	public identifiedBy = 'id';
	public path = 'model';
	public searchable?: string[];
	public searchJoins?: Join[];

	async getMany(request: GetManyRequest<T>) {
		const search: SelectQuery<T> = {};

		if (request.query?.columns) {
			search.columns = request.query.columns;
		}

		if (request.query?.order) {
			search.orderBy = request.query.order;
		}

		if (request.query?.limit) {
			search.limit = request.query.limit;
		}

		if (request.query?.offset) {
			search.offset = request.query.offset;
		}

		return await this.repo.find(search);
	}

	async search(request: SearchRequest<T>): Promise<SearchResponse<T>> {
		const search: SelectQuery<T> = {};

		if (request.body.columns) {
			search.columns = request.body.columns;
		}

		if (request.body.where) {
			search.where = <KeyValExpression<T>>request.body.where;
		}

		if (this.searchJoins) {
			search.join = this.searchJoins;
		}

		if (this.searchable && request.body.search) {
			const likequery = [];

			for (let i = 0; i < this.searchable.length; i++) {
				const searchable = this.searchable[i];

				likequery.push({
					[searchable]: like('%' + request.body.search.trim() + '%'),
				});

				if (i < this.searchable.length - 1) {
					likequery.push(or);
				}
			}

			search.where = search.where
				? [search.where, and, likequery]
				: <any>likequery;
		}

		let count: undefined | number;
		console.log('with count?', request.body.withCount);
		if (request.body.withCount) {
			count = await this.repo.count(search);
			console.log('count: ', count);
		}

		if (request.body.order) {
			search.orderBy = request.body.order;
		}

		if (request.body.limit) {
			search.limit = request.body.limit;
		}

		if (request.body.offset) {
			search.offset = request.body.offset;
		}

		return {
			results: await this.repo.find(search),
			count,
		};
	}

	async getOne(request: GetOneRequest) {
		return await this.repo.findOneOrFail({
			where: <T>{ [this.identifiedBy]: request.params.id },
		});
	}

	async postOne(request: PostOneRequest<T>) {
		const record = await this.repo.insertOne({
			record: <T>request.body,
		});

		const id = record[this.identifiedBy];

		if (!id) {
			throw new Error(
				'Could not receive ID back from query. ' +
					'Check that the repository identifiedBy is set properly.'
			);
		}

		return await this.getOne({ params: { id } });
	}

	async patchOne(request: PatchOneRequest<T>) {
		await this.repo.update({
			where: <T>{ [this.identifiedBy]: request.params.id },
			set: request.body,
		});

		return await this.getOne({ params: { id: request.params.id } });
	}

	async deleteOne(request: DeleteOneRequest) {
		await this.repo.delete({
			where: <T>{ [this.identifiedBy]: request.params.id },
		});
	}
}
