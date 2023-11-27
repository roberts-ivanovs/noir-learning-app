import { MINIMUM_AGE, generateProof } from '../lib/noirdemo';
import { createSignal, createResource } from 'solid-js';
import { QRCodeSVG } from 'solid-qr-code';
import { unpack, pack } from 'msgpackr';

export function EntrantPage() {
  const [age, setAge] = createSignal<number | undefined>(undefined);
  const [proof, obj] = createResource(age, async (ageN) => {
    const proof = await generateProof(ageN);
    console.log(proof);
    // console.log(pack(proof.proof));
    return { proof: proof.proof, publicInputs: proof.publicInputs };
  });

  return (
    <div class="text-black bg-white p-10 rounded-lg shadow-lg text-center">
      <h1 class="text-2xl font-bold mb-4">ENTRANT</h1>
      <div class="mb-4">
        <label for="age" class="block text-lg mb-2">
          ENTER AGE
        </label>
        <input
          type="number"
          id="age"
          name="age"
          value={age()}
          class="border-2 border-gray-300 rounded-lg p-2 w-full text-white focus:outline-none focus:border-purple-500"
          placeholder="Enter your age"
          onChange={(e) => {
            const age = parseInt(e.currentTarget.value);
            setAge(age);
          }}
        />
      </div>
      <button
        class="bg-purple-600 text-white text-lg rounded-lg px-6 py-2 w-full hover:bg-purple-700 focus:outline-none"
        onClick={async () => {
          obj.refetch();
        }}
      >
        GENERATE PROOF
      </button>
      {proof.state === 'errored' && <p class="text-gray-500">Errored...</p>}
      {proof.state === 'pending' && <p class="text-gray-500">Generating...</p>}
      {proof.state === 'refreshing' && (
        <p class="text-gray-500">Refreshing...</p>
      )}
      {proof.state === 'unresolved' && <div />}
      {proof.state === 'ready' && (
        <div>
          <div>Age: {age()}</div>
          <div>Minimal age: {MINIMUM_AGE}</div>
          <div>Proof: {uint8ArrayToHex(proof.latest.proof)}</div>
          <QRCodeSVG value={proof} size={600} />
        </div>
      )}
    </div>
  );
}

export function uint8ArrayToHex(uint8array: Buffer) {
  return Array.from(uint8array)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
