import { DatabaseRecord, QueryRepository, SelectQuery } from '@riao/dbal';
import { ControllerInterface } from '../controller/controller';
import {
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
	SearchRequest,
} from '@riao/server-contract/request';

export abstract class ModelController<T extends DatabaseRecord = DatabaseRecord>
implements ControllerInterface<T> {
	public repo: QueryRepository<T>;
	public identifiedBy = 'id';
	public path = 'model';

	async getMany(request: GetManyRequest<T>) {
		const search: SelectQuery<T> = {};

		if (request.query.columns) {
			search.columns = request.query.columns;
		}

		if (request.query.order) {
			search.orderBy = request.query.order;
		}

		if (request.query.limit) {
			search.limit = request.query.limit;
		}

		if (request.query.offset) {
			search.offset = request.query.offset;
		}

		return await this.repo.find(search);
	}

	async search(request: SearchRequest<T>) {
		const search: SelectQuery<T> = {};

		if (request.body.columns) {
			search.columns = request.body.columns;
		}

		if (request.body.where) {
			search.where = request.body.where;
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
			where: <T>{ [this.identifiedBy]: +request.params.id }, // TODO: Not always an int!?
		});
	}

	async postOne(request: PostOneRequest<T>) {
		const id = await this.repo.insertOne({
			record: <T>request.body,
		});

		return await this.getOne({
			params: { id: id[this.identifiedBy] },
		});
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
