import { AddComponent } from "./add.component";
import { FormBuilder } from '@angular/forms';

describe("l'ajout des produits", () => {
    var component: AddComponent;

    beforeEach(() => {
        component = new AddComponent(new FormBuilder);
    });

    it('Devrait créer un formulaire avec 15   contrôles', () => {
        expect(component.form.contains('reference')).toBeTruthy();
        expect(component.form.contains('nom')).toBeTruthy();
        expect(component.form.contains('Description')).toBeTruthy();
        expect(component.form.contains('Prix')).toBeTruthy();
        expect(component.form.contains('Tva')).toBeTruthy();
        expect(component.form.contains('Categorie')).toBeTruthy();
        expect(component.form.contains('designation')).toBeTruthy();
        expect(component.form.contains('comandable')).toBeTruthy();
        expect(component.form.contains('enRupture')).toBeTruthy();
        expect(component.form.contains('poid')).toBeTruthy();
        expect(component.form.contains('promotions')).toBeTruthy();
        expect(component.form.contains('memos')).toBeTruthy();
    });

    it('control Validators', () => {
        let control = component.form.get('reference');
        control.setValue('');
        expect(control.valid).toBeFalsy();

        control = component.form.get('nom');
       // Validators required
        control.setValue('');
        expect(control.valid).toBeFalsy();

        //Validators minLength
        control.setValue('a');
        expect(control.valid).toBeFalsy();
    });
});