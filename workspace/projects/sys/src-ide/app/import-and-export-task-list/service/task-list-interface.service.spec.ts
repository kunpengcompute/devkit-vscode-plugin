import { TestBed } from '@angular/core/testing';

import { TaskListInterfaceService } from './task-list-interface.service';

describe('TaskListInterfaceService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: TaskListInterfaceService = TestBed.inject(TaskListInterfaceService);
        expect(service).toBeTruthy();
    });
});
