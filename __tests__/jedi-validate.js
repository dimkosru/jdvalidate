import JediValidate from '../src/jedi-validate';
import * as ajax from '../src/lib/ajax';

const data = {
    phone: '92356234',
    phone2: 'sdfsefef',
    parent: {
        child: 'value',
    },
};

describe('Jedi Validate', () => {
    let validator = null;
    let wrapper = null;

    beforeEach(() => {
        const template = `
            <form id="myForm4" action="./ajax.php" method="post" class="form-horizontal">
                <div class="form-group">
                    <label for="phoned1" class="col-sm-2 control-label">Phone:</label>
            
                    <div class="col-sm-10">
                        <input name="phone" type="tel" class="form-control" id="phoned1" placeholder="Phone"
                               required value="${data.phone}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="phoned2" class="col-sm-2 control-label">Phone #2:</label>
            
                    <div class="col-sm-10">
                        <input name="phone2" type="tel" class="form-control" id="phoned2"
                               placeholder="Phone #2" value="${data.phone2}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="phoned2" class="col-sm-2 control-label">Parent child:</label>
            
                    <div class="col-sm-10">
                        <input name="parent[child]" type="text" class="form-control" id="phoned2"
                               placeholder="Phone #2" value="${data.parent.child}">
                    </div>
                </div>
                <hr/>
                <button type="submit" class="btn  btn-lg btn-success pull-right">Send</button>
            </form>
            <div class="base-error alert alert-danger" role="alert" style="display: none"></div>
        `;

        wrapper = document.createElement('div');
        wrapper.innerHTML = template;

        validator = new JediValidate(wrapper, {
            rules: {
                phone: {
                    check: true,
                },
            },
            language: 'ru',
        });
    });

    describe('collect', () => {
        it('collect one field', () => {
            expect(validator.collect('phone')).toEqual({ phone: data.phone });
            expect(validator.collect('phone2')).toEqual({ phone2: data.phone2 });
            expect(validator.collect('parent[child]')).toEqual({ parent: data.parent });
        });

        it('collect two fields', () => {
            expect(validator.collect(['phone', 'parent[child]'])).toEqual({ phone: data.phone, parent: data.parent });
        });

        it('collect all fields', () => {
            expect(validator.collect()).toEqual(data);
            expect(validator.collect()).not.toEqual({ ...data, error: 'error' });
        });
    });

    it('handleInputInput', () => {
        const phoneInput = wrapper.querySelector('[name="phone"]').parentNode.parentNode; // find field

        expect(phoneInput.classList.contains('pristine')).toBe(true);
        expect(phoneInput.classList.contains('dirty')).toBe(false);
        validator.handleInputInput('phone');
        expect(phoneInput.classList.contains('pristine')).toBe(false);
        expect(phoneInput.classList.contains('dirty')).toBe(true);
    });

    it('handleInputChange', () => {
        const phoneInput = wrapper.querySelector('[name="phone"]').parentNode.parentNode; // find field

        expect(phoneInput.classList.contains('pristine')).toBe(true);
        expect(phoneInput.classList.contains('dirty')).toBe(false);
        validator.handleInputInput('phone');
        expect(phoneInput.classList.contains('pristine')).toBe(false);
        expect(phoneInput.classList.contains('dirty')).toBe(true);
        validator.handleInputChange('phone');
        expect(phoneInput.classList.contains('pristine')).toBe(false);
        expect(phoneInput.classList.contains('dirty')).toBe(false);
    });

    it('addMethod', () => {
        const check = () => {};
        validator.addMethod('check', check, 'check error');

        expect(validator.methods.check.func).toBe(check);
        expect(validator.methods.check.message).toBe('check error');

        expect(validator.errorMessages.phone.check).toBe('check error');
    });

    it('addToDictionary', () => {
        validator.addToDictionary('car', 'автомобиль', 'ru');

        expect(validator.translate('car', 'ru')).toBe('автомобиль');
    });

    describe('handleSubmit', () => {
        it('Should call error callback', () => {
            validator.send = jest.fn();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.error = jest.fn();

            validator.handleSubmit(new Event('submit'));

            expect(validator.options.callbacks.error).toHaveBeenCalled();
        });

        it('Should call send', () => {
            validator.send = jest.fn();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.error = jest.fn();
            validator.root.querySelector('#phoned2').value = 231232322;

            validator.handleSubmit(new Event('submit'));

            expect(validator.send).toHaveBeenCalled();
        });

        it('Error on callback', () => {
            validator.send = jest.fn();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.error = () => {
                throw new Error('error');
            };

            expect(validator.handleSubmit.bind(null, new Event('submit'))).not.toThrow();
        });

        it('Success on callback', () => {
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.success = jest.fn();
            validator.options.ajax = false;
            validator.root.querySelector('#phoned2').value = 231232322;

            validator.handleSubmit(new Event('submit'));

            expect(validator.options.callbacks.success).toHaveBeenCalled();
        });

        it('Success throw callback', () => {
            validator.send = jest.fn();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.success = () => {
                throw new Error('error');
            };
            validator.options.ajax = false;
            validator.root.querySelector('#phoned2').value = 231232322;

            validator.handleSubmit(new Event('submit'));

            expect(validator.send).not.toHaveBeenCalled();
        });
    });

    describe('send', () => {
        it('Should call ajax', () => {
            const ajaxFn = jest.spyOn(ajax, 'ajax');
            validator.send({});

            expect(ajaxFn).toHaveBeenCalled();
        });
    });
});

describe('Merge options', () => {
    it('Should merge options', () => {
        const template = `
            <form id="myForm4" action="./ajax.php" method="post" enctype="multipart/form-data" class="form-horizontal">
                <div class="parent">
                    <label for="phoned1" class="col-sm-2 control-label">Phone:</label>
            
                    <div class="col-sm-10">
                        <input name="phone" type="tel" class="form-control" id="phoned1" placeholder="Phone"
                               required value="${data.phone}">
                    </div>
                </div>
                <div class="parent">
                    <label for="phoned2" class="col-sm-2 control-label">Phone #2:</label>
            
                    <div class="col-sm-10">
                        <input name="phone2" type="tel" class="form-control" id="phoned2"
                               placeholder="Phone #2" value="${data.phone2}">
                    </div>
                </div>
                <div class="parent">
                    <label for="phoned2" class="col-sm-2 control-label">Parent child:</label>
            
                    <div class="col-sm-10">
                        <input name="parent[child]" type="text" class="form-control" id="phoned2"
                               placeholder="Phone #2" value="${data.parent.child}">
                    </div>
                </div>
                <hr/>
                <button type="submit" class="btn  btn-lg btn-success pull-right">Send</button>
            </form>
            <div class="base-error alert alert-danger" role="alert" style="display: none"></div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = template;

        const callback = jest.fn();

        const validator = new JediValidate(wrapper, {
            ajax: {
                url: './ajax.json',
            },
            containers: {
                parent: 'parent',
            },
            callbacks: {
                error: callback,
                success: callback,
            },
            rules: {
                phone: {
                    check: true,
                },
            },
            language: 'ru',
        });

        expect(validator.options).toEqual({
            ajax: {
                enctype: 'multipart/form-data',
                sendType: 'formData',
                method: 'post',
                url: './ajax.json',
            },
            callbacks: {
                error: callback,
                success: callback,
            },
            clean: true,
            containers: {
                baseMessage: 'base-error',
                message: 'help-block',
                parent: 'parent',
            },
            formStatePrefix: 'jedi-',
            language: 'ru',
            messages: {},
            redirect: true,
            rules: {
                phone: {
                    check: true,
                },
            },
            states: {
                dirty: 'dirty',
                error: 'error',
                pristine: 'pristine',
                valid: 'valid',
            },
            translations: {},
        });
    });

    it('Should merge rules', () => {
        const template = `
            <form id="myForm4" action="./ajax.php" method="post" enctype="multipart/form-data" class="form-horizontal">
                <div class="parent">
                    <label for="phoned1" class="col-sm-2 control-label">Phone:</label>
            
                    <div class="col-sm-10">
                        <input name="phone" type="tel" class="form-control" id="phoned1" placeholder="Phone"
                               required value="${data.phone}">
                    </div>
                </div>
                <div class="parent">
                    <label for="phoned2" class="col-sm-2 control-label">Phone #2:</label>
            
                    <div class="col-sm-10">
                        <input name="phone2" type="tel" class="form-control" id="phoned2"
                               placeholder="Phone #2" value="${data.phone2}">
                    </div>
                </div>
                <div class="parent">
                    <label for="phoned2" class="col-sm-2 control-label">Parent child:</label>
            
                    <div class="col-sm-10">
                        <input name="parent[child]" type="text" class="form-control" id="phoned2"
                               placeholder="Phone #2" value="${data.parent.child}">
                    </div>
                </div>
                <hr/>
                <button type="submit" class="btn  btn-lg btn-success pull-right">Send</button>
            </form>
            <div class="base-error alert alert-danger" role="alert" style="display: none"></div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = template;

        const callback = jest.fn();

        const validator = new JediValidate(wrapper, {
            ajax: {
                url: './ajax.json',
            },
            containers: {
                parent: 'parent',
            },
            callbacks: {
                error: callback,
                success: callback,
            },
            rules: {
                phone: {
                    check: ['phone2', true],
                },
            },
            language: 'ru',
        });

        expect(validator.rules).toEqual({
            'parent[child]': {},
            phone: {
                check: ['phone2', true, 'phone2', true],
                required: true,
                tel: true,
            },
            phone2: {
                tel: true,
            },
        });
    });
});
