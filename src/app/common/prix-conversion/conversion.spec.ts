// import { conversion } from "./conversion";



// describe("Conversion des prix", () => {
//     let convert =  new conversion();
//     it("Résultat de changement de tva", () => {
//         let GetHTbyTva = (prixHt: string, tva: string) => {
//             return parseFloat(prixHt) * (1 + parseFloat(tva) / 100);
//         }

//         let GetHTbyTvaResult: number = convert.GetTTcByTva('150', '20');
//         expect(GetHTbyTvaResult).toEqual(GetHTbyTva('150', '20'));

//         GetHTbyTvaResult = convert.GetTTcByTva('20', '150');
//         expect(GetHTbyTvaResult).toEqual(GetHTbyTva('20', '150'));
//     });

//     it("Calcule PrixTTC par PrixHt", () => {
//         let GetTTcBYHt = (Ht: string, tva: string) => {
//             return parseFloat(Ht) * (1 + parseFloat(tva) / 100);
//         }

//         let GetTvabyHtResult: number = convert.GetTTcByHt('150', '20');
//         expect(GetTvabyHtResult).toEqual(GetTTcBYHt('150', '20'));
//         GetTvabyHtResult = convert.GetTTcByHt('20', '150');
//         expect(GetTvabyHtResult).toEqual(GetTTcBYHt('20', '150'));
//     });

//     it("Calcule PrixHt par PrixTTC", () => {
//         let calculerHt = (tva:string,tcc:number)=>{
//             return tcc / (1 + parseFloat(tva) / 100);
//         }

//         let GetHtByTTCResult: number = convert.calculerHt('20', 150);
//         expect(GetHtByTTCResult).toEqual(calculerHt('20', 150));
//     });
// });