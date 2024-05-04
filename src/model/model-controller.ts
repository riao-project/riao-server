import { DatabaseRecord, QueryRepository } from '@riao/dbal';
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
		return await this.repo.find({});
	}

	async getOne(request: GetOneRequest) {
		return await this.repo.findOneOrFail({
			where: <T>{ [this.identifiedBy]: +request.id }, // TODO: Not always an int!?
		});
	}

	async postOne(request: PostOneRequest<T>) {
		const id = await this.repo.insertOne({
			record: <T>(<unknown>request),
		});

		return await this.getOne({
			id: id[this.identifiedBy],
		});
	}

	async patchOne(request: PatchOneRequest<T>) {
		await this.repo.update({
			where: <T>{ [this.identifiedBy]: request.id },
			set: request.data,
		});

		return await this.getOne({ id: request.id });
	}

	async deleteOne(request: DeleteOneRequest) {
		await this.repo.delete({
			where: <T>{ [this.identifiedBy]: request.id },
		});
	}
}
