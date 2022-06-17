import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/roles/roles.decorator';
import { RolesGuard } from '../../auth/roles/roles.guard';
import { Role } from '../../users/user.types';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
export class UsersController {
	@Get('test')
	testAdminRoute() {
		return 'Hello';
	}
}
