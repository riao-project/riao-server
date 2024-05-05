import { DatabaseRecord, QueryRepository, SelectQuery } from '@riao/dbal';
import { ControllerInterface } from '../controller/controller';
import {
	DeleteOneRequest,
	GetManyRequest,
	GetOneRequest,
	PatchOneRequest,
	PostOneRequest,
} from '@riao/server-contract/request';

export abstract class ModelController<T extends DatabaseRecord = DatabaseRecord>
implements ControllerInterface<T> {
	public repo: QueryRepository<T>;
	public identifiedBy = 'id';
	public path = 'model';

	async getMany(request: GetManyRequest) {
		const findOptions: SelectQuery<T> = {};

		if (request.query.limit) {
			findOptions.limit = request.query.limit;
		}

		return await this.repo.find(findOptions);
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
