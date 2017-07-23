import JediValidate from '../src/jedi-validate';

const data = {
    phone: '92356234',
    phone2: 'sdfsefef',
    parent: {
        child: 'value',
    },
};

let validator = null;

describe('Jedi Validate', () => {
    before(() => {
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

        const wrapper = document.createElement('div');

        wrapper.innerHTML = template;

        validator = new JediValidate(wrapper);
    });

    describe('collect', () => {
        it('collect one field', () => {
            assert.deepEqual(validator.collect('phone'), {phone: data.phone});
            assert.deepEqual(validator.collect('phone2'), {phone2: data.phone2});
            assert.deepEqual(validator.collect('parent[child]'), {parent: data.parent});
        });

        it('collect two fields', () => {
            assert.deepEqual(validator.collect(['phone', 'parent[child]']), {phone: data.phone, parent: data.parent});
        });

        it('collect all fields', () => {
            assert.deepEqual(validator.collect(), data);
            assert.notDeepEqual(validator.collect(), { ...data, error: 'error' });
        });
    });
});
