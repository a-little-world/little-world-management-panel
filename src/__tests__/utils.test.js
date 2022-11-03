import { recursiveObjectToFormData } from '../utils';

it('list recursiveObjectToFormData', () => {
  const formD = new FormData();
  formD.append('i[]', [0, 1]);
  const recursiveObjFormD = recursiveObjectToFormData({ i: [0, 1] });
  expect(recursiveObjFormD).toEqual(formD);
});

it('complex object recursiveObjectToFormData', () => {
  const formD = new FormData();
  formD.append('key1[a]', 'd');
  formD.append('key1[b][c]', 'e');
  formD.append('key1[b][d]', 'z');
  formD.append('key2[a]', 'f');
  formD.append('key2[b][]', '1,2,3');
  const recursiveObjFormD = recursiveObjectToFormData({
    key1: { a: 'd', b: { c: 'e', d: 'z' } },
    key2: { a: 'f', b: [1, 2, 3] },
  });
  expect(recursiveObjFormD).toEqual(formD);
});
