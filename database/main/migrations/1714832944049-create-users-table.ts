import { ColumnType, Migration } from '@riao/dbal';

export default class CreateUsersTable extends Migration {
	async up() {
		await this.ddl.createTable({
			name: 'users',
			columns: [
				{
					name: 'id',
					type: ColumnType.BIGINT,
					primaryKey: true,
					autoIncrement: true,
				},
				{
					name: 'username',
					type: ColumnType.VARCHAR,
					length: 255,
					required: true,
				},
				{
					name: 'password',
					type: ColumnType.VARCHAR,
					length: 1024,
					required: true,
				},
			],
		});
	}

	async down() {
		await this.ddl.dropTable({ tables: 'users' });
	}
}
