// import * as vscode from "vscode";

import * as BufferLayout from "@solana/buffer-layout";
import {
  PACKET_DATA_SIZE,
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Signer,
} from "@solana/web3.js";

const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey(
  "BPFLoaderUpgradeab1e11111111111111111111111"
);

export const rustVecBytes = (property: string = "string") => {
  const rvbl = BufferLayout.struct<any>(
    [
      BufferLayout.u32("length"),
      BufferLayout.u32("lengthPadding"),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), "bytes"),
    ],
    property
  );
  const _decode = rvbl.decode.bind(rvbl);
  const _encode = rvbl.encode.bind(rvbl);

  rvbl.decode = (buffer: any, offset: any) => {
    const data = _decode(buffer, offset);
    return data["bytes"];
  };

  rvbl.encode = (bytes: Buffer, buffer: any, offset: any) => {
    const data = {
      bytes,
    };
    return _encode(data, buffer, offset);
  };

  (rvbl as any).alloc = (bytes: Buffer) => {
    return BufferLayout.u32().span + BufferLayout.u32().span + bytes.length;
  };

  return rvbl;
};

export function getAlloc(type: any, fields: any): number {
  let alloc = 0;
  type.layout.fields.forEach((item: any) => {
    if (item.span >= 0) {
      alloc += item.span;
    } else if (typeof item.alloc === "function") {
      alloc += item.alloc(fields[item.property]);
    }
  });
  return alloc;
}

export type InstructionType = {
  /** The Instruction index (from solana upstream program) */
  index: number;
  /** The BufferLayout to use to build data */
  layout: BufferLayout.Layout<any>;
};

export function encodeData(type: InstructionType, fields?: any): Buffer {
  const allocLength =
    type.layout.span >= 0 ? type.layout.span : getAlloc(type, fields);
  const data = Buffer.alloc(allocLength);
  const layoutFields = Object.assign({ instruction: type.index }, fields);
  type.layout.encode(layoutFields, data);
  return data;
}

/**
 * An enumeration of valid BpfUpgradeableLoaderInstructionType's
 */
type BpfUpgradeableLoaderInstructionType =
  | "InitializeBuffer"
  | "Write"
  | "DeployWithMaxDataLen"
  | "Upgrade"
  | "SetAuthority"
  | "Close";

/**
 * An enumeration of valid system InstructionType's
 * @internal
 */
const BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS: {
  [type in BpfUpgradeableLoaderInstructionType]: InstructionType;
} = Object.freeze({
  InitializeBuffer: {
    index: 0,
    layout: BufferLayout.struct<BufferLayout.UInt>([
      BufferLayout.u32("instruction"),
    ]),
  },
  Write: {
    index: 1,
    layout: BufferLayout.struct<BufferLayout.UInt>([
      BufferLayout.u32("instruction"),
      BufferLayout.u32("offset"),
      rustVecBytes("bytes"),
    ]),
  },
  DeployWithMaxDataLen: {
    index: 2,
    layout: BufferLayout.struct<BufferLayout.UInt>([
      BufferLayout.u32("instruction"),
      BufferLayout.u32("maxDataLen"),
      BufferLayout.u32("maxDataLenPadding"),
    ]),
  },
  Upgrade: {
    index: 3,
    layout: BufferLayout.struct<BufferLayout.UInt>([
      BufferLayout.u32("instruction"),
    ]),
  },
  SetAuthority: {
    index: 4,
    layout: BufferLayout.struct<BufferLayout.UInt>([
      BufferLayout.u32("instruction"),
    ]),
  },
  Close: {
    index: 5,
    layout: BufferLayout.struct<BufferLayout.UInt>([
      BufferLayout.u32("instruction"),
    ]),
  },
});

/**
 * Initialize buffer tx params
 */
type InitializeBufferParams = {
  /** Public key of the buffer account */
  bufferPk: PublicKey;
  /** Public key to set as authority of the initialized buffer */
  authorityPk: PublicKey;
};

/**
 * Write tx params
 */
type WriteParams = {
  /** Offset at which to write the given bytes. */
  offset: number;
  /** Chunk of program data */
  bytes: Buffer;
  /** Public key of the buffer account */
  bufferPk: PublicKey;
  /** Public key to set as authority of the initialized buffer */
  authorityPk: PublicKey;
};

/**
 * Deploy a program tx params
 */
type DeployWithMaxProgramLenParams = {
  /** Maximum length that the program can be upgraded to. */
  maxDataLen: number;
  /** The uninitialized Program account */
  programPk: PublicKey;
  /** The buffer account where the program data has been written. The buffer account’s authority must match the program’s authority */
  bufferPk: PublicKey;
  /** The program’s authority */
  upgradeAuthorityPk: PublicKey;
  /** The payer account that will pay to create the ProgramData account */
  payerPk: PublicKey;
};

/**
 * Upgrade tx params
 */
type UpgradeParams = {
  /** The program account */
  programPk: PublicKey;
  /** The buffer account where the program data has been written. The buffer account’s authority must match the program’s authority */
  bufferPk: PublicKey;
  /** The spill account */
  spillPk: PublicKey;
  /** The program’s authority */
  authorityPk: PublicKey;
};

/**
 * Update buffer authority tx params
 */
type SetBufferAuthorityParams = {
  /** The buffer account where the program data has been written */
  bufferPk: PublicKey;
  /** The buffer's authority */
  authorityPk: PublicKey;
  /** New buffer's authority */
  newAuthorityPk: PublicKey;
};

/**
 * Update program authority tx params
 */
type SetUpgradeAuthorityParams = {
  /** The program account */
  programPk: PublicKey;
  /** The current authority */
  authorityPk: PublicKey;
  /** The new authority, optional, if omitted then the program will not be upgradeable */
  newAuthorityPk: PublicKey | undefined;
};

/**
 * Close account tx params
 */
type CloseParams = {
  /** The account to close */
  closePk: PublicKey;
  /** The account to deposit the closed account’s lamports */
  recipientPk: PublicKey;
  /** The account’s authority, Optional, required for initialized accounts */
  authorityPk: PublicKey | undefined;
  /** The associated Program account if the account to close is a ProgramData account */
  programPk: PublicKey | undefined;
};

/**
 * Factory class for txs to interact with the BpfLoaderUpgradeable program
 */
class BpfLoaderUpgradeableProgram {
  /**
   * Public key that identifies the BpfLoaderUpgradeable program
   */
  static programId: PublicKey = BPF_LOADER_UPGRADEABLE_PROGRAM_ID;

  /**
   * Derive programData address from program
   */
  static getProgramDataAddress(programPk: PublicKey): PublicKey {
    const [programDataAddress] = PublicKey.findProgramAddressSync(
      [programPk.toBuffer()],
      this.programId
    );
    return programDataAddress;
  }

  /**
   * Generate a tx instruction that initialize buffer account
   */
  static initializeBuffer(
    params: InitializeBufferParams
  ): TransactionInstruction {
    const type = BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.InitializeBuffer;
    const data = encodeData(type, {});

    return new TransactionInstruction({
      keys: [
        { pubkey: params.bufferPk, isSigner: false, isWritable: true },
        { pubkey: params.authorityPk, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  /**
   * Generate a tx instruction that write a chunk of program data
   *   to a buffer account
   */
  static write(params: WriteParams): TransactionInstruction {
    const type = BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.Write;
    const data = encodeData(type, {
      offset: params.offset,
      bytes: params.bytes,
    });

    return new TransactionInstruction({
      keys: [
        { pubkey: params.bufferPk, isSigner: false, isWritable: true },
        { pubkey: params.authorityPk, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    });
  }

  /* Generate a tx instruction that deploy a program with a specified maximum program length */
  static deployWithMaxProgramLen(
    params: DeployWithMaxProgramLenParams
  ): TransactionInstruction {
    const type =
      BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.DeployWithMaxDataLen;
    const data = encodeData(type, {
      maxDataLen: params.maxDataLen,
      maxDataLenPadding: 0,
    });

    const programDataPk = this.getProgramDataAddress(params.programPk);

    return new TransactionInstruction({
      keys: [
        { pubkey: params.payerPk, isSigner: true, isWritable: true },
        { pubkey: programDataPk, isSigner: false, isWritable: true },
        { pubkey: params.programPk, isSigner: false, isWritable: true },
        { pubkey: params.bufferPk, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        {
          pubkey: params.upgradeAuthorityPk,
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: this.programId,
      data,
    });
  }

  /* Generate a tx instruction that upgrade a program */
  static upgrade(params: UpgradeParams): TransactionInstruction {
    const type = BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.Upgrade;
    const data = encodeData(type, {});
    const programDataPk = this.getProgramDataAddress(params.programPk);
    return new TransactionInstruction({
      keys: [
        { pubkey: programDataPk, isSigner: false, isWritable: true },
        { pubkey: params.programPk, isSigner: false, isWritable: true },
        { pubkey: params.bufferPk, isSigner: false, isWritable: true },
        { pubkey: params.spillPk, isSigner: true, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        {
          pubkey: params.authorityPk,
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: this.programId,
      data,
    });
  }

  /**
   * Generate a tx instruction that set a new buffer authority
   */
  static setBufferAuthority(
    params: SetBufferAuthorityParams
  ): TransactionInstruction {
    const type = BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.SetAuthority;
    const data = encodeData(type, {});

    return new TransactionInstruction({
      keys: [
        { pubkey: params.bufferPk, isSigner: false, isWritable: true },
        {
          pubkey: params.authorityPk,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: params.newAuthorityPk,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: this.programId,
      data,
    });
  }

  /* * Generate a tx instruction that set a new program authority */
  static setUpgradeAuthority(
    params: SetUpgradeAuthorityParams
  ): TransactionInstruction {
    const type = BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.SetAuthority;
    const data = encodeData(type, {});

    const programDataPk = this.getProgramDataAddress(params.programPk);

    const keys = [
      { pubkey: programDataPk, isSigner: false, isWritable: true },
      {
        pubkey: params.authorityPk,
        isSigner: true,
        isWritable: false,
      },
    ];

    if (params.newAuthorityPk) {
      keys.push({
        pubkey: params.newAuthorityPk,
        isSigner: false,
        isWritable: false,
      });
    }

    return new TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }

  /**
   * Generate a tx instruction that close program, buffer, or
   *   uninitialized account
   */
  static close(params: CloseParams): TransactionInstruction {
    const type = BPF_UPGRADEABLE_LOADER_INSTRUCTION_LAYOUTS.Close;
    const data = encodeData(type, {});

    const keys = [
      { pubkey: params.closePk, isSigner: false, isWritable: true },
      {
        pubkey: params.recipientPk,
        isSigner: false,
        isWritable: true,
      },
    ];

    if (params.authorityPk) {
      keys.push({
        pubkey: params.authorityPk,
        isSigner: true,
        isWritable: false,
      });
    }

    if (params.programPk) {
      keys.push({
        pubkey: params.programPk,
        isSigner: false,
        isWritable: true,
      });
    }

    return new TransactionInstruction({
      keys,
      programId: this.programId,
      data,
    });
  }
}

/**
 * BpfLoaderUpgradeable program interface
 */
export class BpfLoaderUpgradeable {
  /**
   * Buffer account size without data
   */
  static BUFFER_HEADER_SIZE: number = 37; // Option<Pk>

  /**
   * Program account size
   */
  static BUFFER_PROGRAM_SIZE: number = 36; // Pk

  /**
   * ProgramData account size without data
   */
  static BUFFER_PROGRAM_DATA_HEADER_SIZE: number = 45; // usize + Option<Pk>

  /**
   * Maximal chunk of the data per tx
   */
  static WRITE_CHUNK_SIZE: number = PACKET_DATA_SIZE - 220; // Data with 1 signature

  /**
   * Get buffer account size
   */
  static getBufferAccountSize(programLen: number): number {
    return this.BUFFER_HEADER_SIZE + programLen;
  }

  static buildTransaction(
    instructions: TransactionInstruction[],
    deployer: PublicKey,
    recentBlockhash: string,
    additionalSigners: Signer[]
  ): Transaction {
    const tx: Transaction = new Transaction();
    for (const instruction of instructions) tx.add(instruction);
    tx.recentBlockhash = recentBlockhash;
    tx.feePayer = deployer;
    if (additionalSigners.length) tx.partialSign(...additionalSigners);
    return tx;
  }

  /* Create and initialize buffer account */
  static createBuffer(
    deployer: PublicKey,
    buffer: Signer,
    lamports: number,
    programLen: number,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        SystemProgram.createAccount({
          fromPubkey: deployer,
          newAccountPubkey: buffer.publicKey,
          lamports,
          space: this.getBufferAccountSize(programLen),
          programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
        }),
        BpfLoaderUpgradeableProgram.initializeBuffer({
          bufferPk: buffer.publicKey,
          authorityPk: deployer,
        }),
      ],
      deployer,
      recentBlockhash,
      [buffer]
    );
  }

  /* Update buffer authority */
  static setBufferAuthority(
    deployer: PublicKey,
    bufferPk: PublicKey,
    newAuthorityPk: PublicKey,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        BpfLoaderUpgradeableProgram.setBufferAuthority({
          bufferPk,
          authorityPk: deployer,
          newAuthorityPk,
        }),
      ],
      deployer,
      recentBlockhash,
      []
    );
  }

  /* Load programData to initialized buffer account */
  static loadBuffer(
    deployer: PublicKey,
    bufferPk: PublicKey,
    programData: Buffer,
    recentBlockhash: string
  ): Transaction[] {
    const transactions: Transaction[] = [];
    let bytesOffset = 0;
    while (true) {
      const offset = bytesOffset;
      bytesOffset += BpfLoaderUpgradeable.WRITE_CHUNK_SIZE;

      const bytes = programData.subarray(
        offset,
        offset + BpfLoaderUpgradeable.WRITE_CHUNK_SIZE
      );
      if (bytes.length === 0) break;

      transactions.push(
        this.buildTransaction(
          [
            BpfLoaderUpgradeableProgram.write({
              offset,
              bytes,
              bufferPk,
              authorityPk: deployer,
            }),
          ],
          deployer,
          recentBlockhash,
          []
        )
      );
    }
    return transactions;
  }

  /* Close buffer account and withdraw funds */
  static closeBuffer(
    deployer: PublicKey,
    bufferPk: PublicKey,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        BpfLoaderUpgradeableProgram.close({
          closePk: bufferPk,
          recipientPk: deployer,
          authorityPk: deployer,
          programPk: undefined,
        }),
      ],
      deployer,
      recentBlockhash,
      []
    );
  }

  /* create program account from initialized buffer */
  static deployProgram(
    deployer: PublicKey,
    bufferPk: PublicKey,
    program: Signer,
    programLamports: number,
    maxDataLen: number,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        SystemProgram.createAccount({
          fromPubkey: deployer,
          newAccountPubkey: program.publicKey,
          lamports: programLamports,
          space: this.BUFFER_PROGRAM_SIZE,
          programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
        }),
        BpfLoaderUpgradeableProgram.deployWithMaxProgramLen({
          programPk: program.publicKey,
          bufferPk,
          upgradeAuthorityPk: deployer,
          payerPk: deployer,
          maxDataLen,
        }),
      ],
      deployer,
      recentBlockhash,
      [program]
    );
  }

  /* Update program authority */
  static setProgramAuthority(
    programPk: PublicKey,
    deployer: PublicKey,
    newAuthorityPk: PublicKey | undefined,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        BpfLoaderUpgradeableProgram.setUpgradeAuthority({
          programPk,
          authorityPk: deployer,
          newAuthorityPk,
        }),
      ],
      deployer,
      recentBlockhash,
      []
    );
  }

  /* Upgrade a program */
  static upgradeProgram(
    programPk: PublicKey,
    deployer: PublicKey,
    bufferPk: PublicKey,
    spillPk: PublicKey,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        BpfLoaderUpgradeableProgram.upgrade({
          programPk,
          bufferPk,
          spillPk,
          authorityPk: deployer,
        }),
      ],
      deployer,
      recentBlockhash,
      []
    );
  }

  /* Close program account and withdraw funds */
  static closeProgram(
    programPk: PublicKey,
    deployer: PublicKey,
    recentBlockhash: string
  ): Transaction {
    return this.buildTransaction(
      [
        BpfLoaderUpgradeableProgram.close({
          closePk: BpfLoaderUpgradeableProgram.getProgramDataAddress(programPk),
          recipientPk: deployer,
          authorityPk: deployer,
          programPk,
        }),
      ],
      deployer,
      recentBlockhash,
      []
    );
  }
}
