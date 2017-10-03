import should from 'should';
import sinon from 'sinon';
import JediValidate from '../src/jedi-validate';

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
            assert.deepEqual(validator.collect('phone'), { phone: data.phone });
            assert.deepEqual(validator.collect('phone2'), { phone2: data.phone2 });
            assert.deepEqual(validator.collect('parent[child]'), { parent: data.parent });
        });

        it('collect two fields', () => {
            assert.deepEqual(validator.collect(['phone', 'parent[child]']), { phone: data.phone, parent: data.parent });
        });

        it('collect all fields', () => {
            assert.deepEqual(validator.collect(), data);
            assert.notDeepEqual(validator.collect(), { ...data, error: 'error' });
        });
    });

    it('handleInputInput', () => {
        const phoneInput = wrapper.querySelector('[name="phone"]').parentNode.parentNode; // find field

        should(phoneInput.classList.contains('pristine')).be.true();
        should(phoneInput.classList.contains('dirty')).be.false();
        validator.handleInputInput('phone');
        should(phoneInput.classList.contains('pristine')).be.false();
        should(phoneInput.classList.contains('dirty')).be.true();
    });

    it('handleInputChange', () => {
        const phoneInput = wrapper.querySelector('[name="phone"]').parentNode.parentNode; // find field

        should(phoneInput.classList.contains('pristine')).be.true();
        should(phoneInput.classList.contains('dirty')).be.false();
        validator.handleInputInput('phone');
        should(phoneInput.classList.contains('pristine')).be.false();
        should(phoneInput.classList.contains('dirty')).be.true();
        validator.handleInputChange('phone');
        should(phoneInput.classList.contains('pristine')).be.false();
        should(phoneInput.classList.contains('dirty')).be.false();
    });

    it('addMethod', () => {
        const check = () => {
        };
        validator.addMethod('check', check, 'check error');

        should(validator.methods.check.func).be.equal(check);
        should(validator.methods.check.message).be.equal('check error');

        should(validator.errorMessages.phone.check).be.equal('check error');
    });

    it('addToDictionary', () => {
        validator.addToDictionary('car', 'автомобиль', 'ru');

        should(validator.translate('car', 'ru')).be.equal('автомобиль');
    });

    describe('handleSubmit', () => {
        it('Should call error callback', () => {
            validator.send = sinon.spy();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.error = sinon.spy();

            validator.handleSubmit(new Event('submit'));

            sinon.assert.calledOnce(validator.options.callbacks.error);
        });

        it('Should call send', () => {
            validator.send = sinon.spy();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.error = sinon.spy();
            validator.root.querySelector('#phoned2').value = 231232322;

            validator.handleSubmit(new Event('submit'));

            sinon.assert.calledOnce(validator.send);
        });

        it('Error on callback', () => {
            validator.send = sinon.spy();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.error = () => {
                throw new Error('error');
            };

            should(validator.handleSubmit(new Event('submit'))).not.throw();
        });

        it('Success on callback', () => {
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.success = sinon.spy();
            validator.options.ajax = false;
            validator.root.querySelector('#phoned2').value = 231232322;

            validator.handleSubmit(new Event('submit'));

            sinon.assert.calledOnce(validator.options.callbacks.success);
        });

        it('Success throw callback', () => {
            validator.send = sinon.spy();
            validator.addMethod('check', () => true, 'check error');
            validator.options.callbacks.success = () => {
                throw new Error('error');
            };
            validator.options.ajax = false;
            validator.root.querySelector('#phoned2').value = 231232322;

            validator.handleSubmit(new Event('submit'));

            sinon.assert.callCount(validator.send, 0);
        });
    });
});
