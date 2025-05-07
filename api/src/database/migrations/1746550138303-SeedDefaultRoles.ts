import { MigrationInterface, QueryRunner } from "typeorm";
import { Role } from "../../modules/roles/entities/role.entity"; // Adjust path as needed

export class SeedDefaultRoles1746550138303 implements MigrationInterface {
    name = 'SeedDefaultRoles1746550138303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const roleRepository = queryRunner.manager.getRepository(Role);

        // Seed Admin Role
        let adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
        if (!adminRole) {
            adminRole = roleRepository.create({
                name: 'Admin',
                description: 'Administrator with full system access',
                is_system_role: true, // Mark as a system role
                permissions: [] // Admin role might get permissions via a different process or all implicitly
            });
            await roleRepository.save(adminRole);
            console.log('Admin role seeded');
        } else {
            console.log('Admin role already exists');
        }

        // Seed Manager Role
        let managerRole = await roleRepository.findOne({ where: { name: 'Manager' } });
        if (!managerRole) {
            managerRole = roleRepository.create({
                name: 'Manager',
                description: 'Manager with operational permissions',
                is_system_role: false,
                permissions: [] // Manager role might get permissions via a different process or all implicitly
            });
            await roleRepository.save(managerRole);
            console.log('Manager role seeded');
        } else {
            console.log('Manager role already exists');
        }
        
        // Seed Photographer Role
        let photographerRole = await roleRepository.findOne({ where: { name: 'Photographer' } });
        if (!photographerRole) {
            photographerRole = roleRepository.create({
                name: 'Photographer',
                description: 'Photographer role for show assignments',
                is_system_role: false,
                permissions: [] // Photographer role might get permissions via a different process or all implicitly
            });
            await roleRepository.save(photographerRole);
            console.log('Photographer role seeded');
        } else {
            console.log('Photographer role already exists');
        }

        // Seed User Role (can be a fallback or default)
        let userRole = await roleRepository.findOne({ where: { name: 'User' } });
        if (!userRole) {
            userRole = roleRepository.create({
                name: 'User',
                description: 'Standard user with basic access',
                is_system_role: false,
                permissions: [] // Basic users might have specific default permissions assigned elsewhere
            });
            await roleRepository.save(userRole);
            console.log('User role seeded');
        } else {
            console.log('User role already exists');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // In a real scenario, you might want to make this idempotent too,
        // or only remove roles if they were indeed created by this seed.
        // For simplicity, this down migration will attempt to delete them if they exist.
        // However, be cautious if other data depends on these roles by name/ID.
        // A safer approach for `down` might be to do nothing or only remove if `is_system_role` was set by `up`.

        const roleRepository = queryRunner.manager.getRepository(Role);

        const rolesToDelete = ['Admin', 'Manager', 'Photographer', 'User'];
        for (const roleName of rolesToDelete) {
            const role = await roleRepository.findOne({ where: { name: roleName } });
            if (role) {
                // Before deleting, consider unassigning this role from users or permissions if necessary
                // await queryRunner.query(`DELETE FROM "user_roles" WHERE "role_id" = $1`, [role.id]);
                // await queryRunner.query(`DELETE FROM "role_permissions" WHERE "role_id" = $1`, [role.id]);
                await roleRepository.delete({ name: roleName });
                console.log(`${roleName} role removed by down migration`);
            }
        }
    }

}
